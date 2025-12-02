
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
  const [showStats, setShowStats] = useState(false);
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

  // Derived state for connection pill color
  const statusColor = {
      idle: 'bg-slate-700/50 text-slate-300 border-slate-600',
      connecting: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse',
      connected: 'bg-green-500/20 text-green-400 border-green-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30'
  }[connectionStatus];

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black">
      
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl opacity-50 mix-blend-screen"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl opacity-30 mix-blend-screen"></div>
      </div>

      {/* Header */}
      <div className="relative z-20 flex justify-between items-center px-6 py-4 glass-panel border-b-0 border-x-0 rounded-b-2xl mx-4 mt-0 mb-4">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-900/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight text-white leading-none">WaveApp</h1>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Low Data WebRTC</p>
            </div>
        </div>
        
        {/* Top Right Controls */}
        <div className="flex items-center gap-4">
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 ${statusColor}`}>
                <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-current' : 'bg-current opacity-50'}`}></div>
                {connectionStatus === 'idle' ? 'STANDBY' : connectionStatus.toUpperCase()}
            </div>
            
            <div className="hidden md:flex flex-col items-end">
                 <label className="flex items-center cursor-pointer gap-2 opacity-70 hover:opacity-100 transition-opacity">
                    <span className="text-xs text-slate-300 font-medium">Simulation Mode</span>
                    <div className="relative inline-flex items-center h-5 rounded-full w-9 transition-colors focus:outline-none bg-slate-700">
                        <input type="checkbox" checked={simulationMode} onChange={handleSimulationToggle} className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                </label>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-4 md:p-6 min-h-0">
        
        {/* Start Button Overlay */}
        {connectionStatus !== 'connected' && connectionStatus !== 'connecting' && (
             <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all animate-in fade-in">
                 <div className="text-center">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <button 
                            onClick={startCall}
                            className="relative px-10 py-5 bg-slate-900 ring-1 ring-white/10 hover:bg-slate-800 text-white font-bold text-lg rounded-full transition-all active:scale-95 flex items-center gap-3"
                        >
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                            Start Call
                        </button>
                    </div>
                    <p className="mt-4 text-slate-400 text-sm max-w-xs mx-auto">
                        Connect with peers using ultra-low bandwidth. {simulationMode && "(Simulated)"}
                    </p>
                 </div>
             </div>
        )}

        {/* Video Grid */}
        <div className="w-full h-full max-w-6xl relative flex flex-col md:flex-row gap-4 items-stretch justify-center">
             
             {/* Remote View (Main) */}
             <div className="relative flex-1 rounded-3xl overflow-hidden shadow-2xl video-glow ring-1 ring-white/10 bg-black">
                <VideoContainer 
                    stream={remoteStream} 
                    label="Remote Peer" 
                    isLocal={false} 
                />
                
                {/* Stats Overlay (Absolute on Remote View) */}
                {connectionStatus === 'connected' && showStats && (
                    <NetworkStats stats={stats} />
                )}
             </div>

             {/* Local View (Draggable-ish / Fixed Position for now) */}
             <div className="absolute right-4 bottom-24 md:bottom-8 md:right-8 z-20 shadow-2xl transition-all hover:scale-105 hover:z-30 group">
                <VideoContainer 
                    stream={localStream} 
                    isLocal={true} 
                    muted={true} 
                    label="You"
                    audioOnly={isVideoOff}
                />
             </div>
        </div>

      </div>

      {/* Control Bar Footer */}
      <div className="relative z-40 p-6 flex justify-center">
         <ControlBar 
            isInCall={connectionStatus === 'connected'}
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            showStats={showStats}
            onToggleMute={toggleMute}
            onToggleVideo={toggleVideo}
            onToggleStats={() => setShowStats(!showStats)}
            onEndCall={handleRefresh}
         />
      </div>

    </div>
  );
};

export default App;
