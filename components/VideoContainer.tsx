import React, { useRef, useEffect } from 'react';

interface Props {
  stream: MediaStream | null;
  isLocal?: boolean;
  label?: string;
  muted?: boolean;
}

const VideoContainer: React.FC<Props> = ({ stream, isLocal = false, label, muted = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-800 shadow-xl border border-white/5 ${isLocal ? 'h-32 w-48 border-2 border-blue-500/50' : 'h-full w-full'}`}>
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted} 
          className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full text-slate-500 animate-pulse">
            {isLocal ? "Initializing..." : "Waiting for peer..."}
        </div>
      )}
      <div className="absolute bottom-2 left-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-xs font-medium text-white/90">
        {label || (isLocal ? "You (Low Data)" : "Peer")}
      </div>
    </div>
  );
};

export default VideoContainer;
