
import React, { useRef, useEffect } from 'react';

interface Props {
  stream: MediaStream | null;
  isLocal?: boolean;
  label?: string;
  muted?: boolean;
  audioOnly?: boolean;
}

const VideoContainer: React.FC<Props> = ({ stream, isLocal = false, label, muted = false, audioOnly = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Fallback visualizer if stream is active but video is muted/disabled
  const showVideo = stream && stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled && !audioOnly;

  return (
    <div className={`relative overflow-hidden bg-slate-950 shadow-2xl transition-all duration-300 ${
        isLocal 
            ? 'h-36 w-24 md:h-48 md:w-32 rounded-xl border border-slate-700/50 hover:border-slate-500' 
            : 'h-full w-full rounded-3xl'
    }`}>
      
      {stream ? (
        <>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={muted} 
                className={`w-full h-full object-cover transition-opacity duration-500 ${isLocal ? 'scale-x-[-1]' : ''} ${showVideo ? 'opacity-100' : 'opacity-0 absolute'}`}
            />
            {!showVideo && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900">
                    <div className="relative">
                        <span className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-ping"></span>
                        <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center relative z-10">
                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                        </div>
                    </div>
                    <span className="text-sm text-slate-500 font-medium">Audio Only</span>
                </div>
            )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full text-slate-600 gap-2 bg-slate-900/50">
            {isLocal ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
            ) : (
                <>
                    <div className="w-20 h-20 rounded-full bg-slate-800/50 animate-pulse flex items-center justify-center">
                        <svg className="w-8 h-8 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </div>
                    <span className="text-sm font-medium opacity-50">Waiting for peer...</span>
                </>
            )}
        </div>
      )}

      {/* Label Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
        <span className="text-xs font-semibold text-white/90 drop-shadow-md">
            {label || (isLocal ? "Me" : "Remote")}
        </span>
        {stream && (
            <div className="flex gap-2">
                 {/* Visual mute indicator if track is muted */}
                 {stream.getAudioTracks()[0] && !stream.getAudioTracks()[0].enabled && (
                     <div className="bg-red-500/90 p-1 rounded-full"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><line x1="1" y1="1" x2="23" y2="23"></line><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9v3a3 3 0 0 0 5.12 2.12"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.002 6.16a3 3 0 0 0-2.12-2.12"></path></svg></div>
                 )}
            </div>
        )}
      </div>
    </div>
  );
};

export default VideoContainer;
