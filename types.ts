export interface SignalingMessage {
  type: 'offer' | 'answer' | 'candidate' | 'join' | 'leave';
  payload?: any;
  senderId?: string;
}

export interface NetworkStats {
  rtt: number;
  packetLoss: number;
  bitrate: number; // kbps
  resolution: string;
  frameRate: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'critical';
}

export interface PeerConnectionConfig {
  iceServers: RTCIceServer[];
}
