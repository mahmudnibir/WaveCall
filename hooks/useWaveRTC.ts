import { useEffect, useRef, useState, useCallback } from 'react';
import { signalingService } from '../services/signalingService';
import { SignalingMessage, NetworkStats } from '../types';
import { ICE_SERVERS, VIDEO_CONSTRAINTS, AUDIO_CONSTRAINTS, BITRATE_CONFIG } from '../constants';
import { setMediaBitrates } from '../services/sdpUtils';

export const useWaveRTC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');
  const [stats, setStats] = useState<NetworkStats>({
    rtt: 0,
    packetLoss: 0,
    bitrate: 0,
    resolution: '0x0',
    frameRate: 0,
    connectionQuality: 'excellent',
  });

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const statsInterval = useRef<number | null>(null);
  const lastBytesReceived = useRef<number>(0);
  const lastTimestamp = useRef<number>(0);

  // Initialize Media
  const initMedia = useCallback(async (audioOnly: boolean = false) => {
    try {
      const constraints = {
        audio: AUDIO_CONSTRAINTS,
        video: audioOnly ? false : VIDEO_CONSTRAINTS,
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      return null;
    }
  }, []);

  // WebRTC Setup
  const createPeerConnection = useCallback(() => {
    if (peerConnection.current) return peerConnection.current;

    const pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
      iceTransportPolicy: 'all', // Allow all, but we prioritize P2P via candidate sorting implicitly by browser
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        signalingService.send({ type: 'candidate', payload: event.candidate });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE State:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected') setConnectionStatus('connected');
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') setConnectionStatus('failed');
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    peerConnection.current = pc;
    return pc;
  }, []);

  // Limit Bitrate Logic
  const optimizeBandwidth = async () => {
    if (!peerConnection.current) return;
    const senders = peerConnection.current.getSenders();
    
    for (const sender of senders) {
      if (sender.track?.kind === 'video') {
        const params = sender.getParameters();
        if (!params.encodings) params.encodings = [{}];
        
        // Force max bitrate for low-data mode
        params.encodings[0].maxBitrate = BITRATE_CONFIG.MAX_VIDEO_BITRATE; 
        params.encodings[0].networkPriority = 'low'; // Hint browser
        
        try {
          await sender.setParameters(params);
          console.log('Video bitrate limited to', BITRATE_CONFIG.MAX_VIDEO_BITRATE);
        } catch (e) {
          console.error('Failed to set video parameters', e);
        }
      }
    }
  };

  // Stats Monitoring
  const startStatsMonitoring = useCallback(() => {
    if (statsInterval.current) clearInterval(statsInterval.current);

    statsInterval.current = window.setInterval(async () => {
      if (!peerConnection.current || connectionStatus !== 'connected') return;

      const report = await peerConnection.current.getStats();
      let rtt = 0;
      let packetLoss = 0;
      let bitrate = 0;
      let width = 0;
      let height = 0;
      let fps = 0;

      report.forEach((stat) => {
        if (stat.type === 'candidate-pair' && stat.state === 'succeeded') {
          rtt = stat.currentRoundTripTime * 1000;
        }
        if (stat.type === 'inbound-rtp' && stat.kind === 'video') {
          packetLoss = stat.packetsLost;
          
          // Calculate bitrate
          const now = stat.timestamp;
          const bytes = stat.bytesReceived;
          if (lastTimestamp.current) {
            bitrate = ((bytes - lastBytesReceived.current) * 8) / ((now - lastTimestamp.current) / 1000) / 1000; // kbps
          }
          lastBytesReceived.current = bytes;
          lastTimestamp.current = now;

          // Resolution (if available in stats)
          if (stat.frameWidth) {
            width = stat.frameWidth;
            height = stat.frameHeight;
          }
          if (stat.framesPerSecond) {
            fps = stat.framesPerSecond;
          }
        }
      });

      // Simple quality heuristic
      let quality: NetworkStats['connectionQuality'] = 'excellent';
      if (rtt > 300 || packetLoss > 50) quality = 'critical';
      else if (rtt > 150 || packetLoss > 10) quality = 'poor';
      else if (rtt > 100) quality = 'good';

      setStats({
        rtt: Math.round(rtt),
        packetLoss,
        bitrate: Math.round(bitrate),
        resolution: `${width}x${height}`,
        frameRate: Math.round(fps),
        connectionQuality: quality,
      });

      // Auto Fallback Logic
      if (quality === 'critical' && localStream) {
        // In a real app, we might trigger a toast or auto-disable video here
        // For now, we just expose the status
      }

    }, 1000);
  }, [connectionStatus, localStream]);

  // Signaling Handlers
  useEffect(() => {
    signalingService.onMessage(async (msg) => {
      const pc = createPeerConnection();

      switch (msg.type) {
        case 'offer':
          setConnectionStatus('connecting');
          await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
          
          // Add local tracks
          if (localStream) {
            localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
          }

          const answer = await pc.createAnswer();
          // Munge SDP for bandwidth limits if needed (backup to RTCRtpSender)
          const limitedAnswer = new RTCSessionDescription({
            type: 'answer',
            sdp: setMediaBitrates(answer.sdp!, BITRATE_CONFIG.MAX_VIDEO_BITRATE / 1000, BITRATE_CONFIG.AUDIO_BITRATE / 1000)
          });

          await pc.setLocalDescription(limitedAnswer);
          signalingService.send({ type: 'answer', payload: limitedAnswer });
          
          // Apply RtpSender parameters after negotiation
          await optimizeBandwidth();
          break;

        case 'answer':
          await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
          setConnectionStatus('connected');
          await optimizeBandwidth();
          break;

        case 'candidate':
          try {
            await pc.addIceCandidate(new RTCIceCandidate(msg.payload));
          } catch (e) {
            console.error('Error adding ICE candidate', e);
          }
          break;
      }
    });

    return () => {
        if(statsInterval.current) clearInterval(statsInterval.current);
    }
  }, [createPeerConnection, localStream]);

  // Initiate Call
  const startCall = async () => {
    const pc = createPeerConnection();
    
    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    const offer = await pc.createOffer();
    
    // SDP Munging for Bitrate
    const limitedOffer = new RTCSessionDescription({
      type: 'offer',
      sdp: setMediaBitrates(offer.sdp!, BITRATE_CONFIG.MAX_VIDEO_BITRATE / 1000, BITRATE_CONFIG.AUDIO_BITRATE / 1000)
    });

    await pc.setLocalDescription(limitedOffer);
    signalingService.send({ type: 'offer', payload: limitedOffer });
    setConnectionStatus('connecting');
  };

  useEffect(() => {
      if (connectionStatus === 'connected') {
          startStatsMonitoring();
      }
  }, [connectionStatus, startStatsMonitoring]);

  return {
    localStream,
    remoteStream,
    connectionStatus,
    stats,
    initMedia,
    startCall,
    setLocalStream
  };
};
