import React, { useEffect, useState } from 'react';
import { useWaveRTC } from './hooks/useWaveRTC';
import VideoContainer from './components/VideoContainer';
import ControlBar from './components/ControlBar';
import NetworkStats from './components/NetworkStats';
import { signalingService } from './services/signalingService';

const App = () => {
  const {
    localStream,
    remoteStream,
    connectionStatus,
    stats,
    initMedia,
    startCall,
    setLocalStream
  } = useWaveRTC();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [simulationMode, setSimulationMode] = useState(true);

  useEffect(() => {
    // Auto start camera on load
    initMedia();
  }, [initMedia]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };
  
  const handleSimulationToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setSimulationMode(checked);
      signalingService.setSimulationMode(checked);
  };

  const handleRefresh = () => {
      window.location.reload();
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 flex flex-col overflow-hidden">
      
      {/* Header / Brand */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-start pointer-events-none">
        <div>
            <h1 className="text-2xl font-bold tracking-tighter text-blue-400 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            WaveApp
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Ultra-Low Data Mode Active • {stats.connectionQuality.toUpperCase()} Signal
            </p>
        </div>
        
        {/* Connection Status Indicator */}
        <div className="flex flex-col items-end pointer-events-auto gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                connectionStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                'bg-red-500/20 text-red-400 border-red-500/30'
            }`}>
                {connectionStatus === 'idle' ? 'Ready' : connectionStatus.toUpperCase()}
            </div>
            
            <label className="flex items-center cursor-pointer bg-slate-800 px-2 py-1 rounded border border-slate-700">
                <input type="checkbox" checked={simulationMode} onChange={handleSimulationToggle} className="mr-2" />
                <span className="text-xs text-slate-300">Demo Simulation</span>
            </label>
            <p className="text-[10px] text-slate-500 text-right w-48">
                {simulationMode 
                    ? "Open this page in a second tab to test connection locally." 
                    : "Connects to localhost:8080 (Run server.ts first)."}
            </p>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        {connectionStatus !== 'connected' && connectionStatus !== 'connecting' && (
             <div className="absolute z-20 flex flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center animate-pulse border border-blue-400/30">
                     <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path></svg>
                </div>
                <button 
                    onClick={startCall}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all shadow-lg shadow-blue-900/50 active:scale-95"
                >
                    Start Wave Call
                </button>
             </div>
        )}

        <div className="w-full max-w-5xl aspect-video relative bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            {/* Remote Video */}
            <VideoContainer stream={remoteStream} />
            
            {/* Stats Overlay */}
            {connectionStatus === 'connected' && <NetworkStats stats={stats} />}

            {/* Local Video (PIP) */}
            <div className="absolute bottom-6 right-6 z-10 shadow-2xl transition-all hover:scale-105">
                <VideoContainer stream={localStream} isLocal={true} muted={true} />
            </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-30 pointer-events-none">
        <div className="pointer-events-auto">
             <ControlBar 
                isInCall={connectionStatus === 'connected'}
                isMuted={isMuted}
                isVideoOff={isVideoOff}
                onToggleMute={toggleMute}
                onToggleVideo={toggleVideo}
                onEndCall={handleRefresh}
             />
        </div>
      </div>
    </div>
  );
};

export default App;
