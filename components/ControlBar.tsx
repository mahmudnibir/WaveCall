
import React from 'react';

interface Props {
  isMuted: boolean;
  isVideoOff: boolean;
  showStats: boolean;
  isInCall: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleStats: () => void;
  onEndCall: () => void;
}

const ControlBar: React.FC<Props> = ({ 
  isMuted, 
  isVideoOff, 
  showStats,
  isInCall, 
  onToggleMute, 
  onToggleVideo, 
  onToggleStats,
  onEndCall 
}) => {
  
  const Button = ({ onClick, isActive, activeClass, inactiveClass, icon, label, danger = false }: any) => (
    <div className="group relative flex flex-col items-center gap-2">
        <button
            onClick={onClick}
            className={`
                relative w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-200
                border shadow-lg active:scale-95
                ${isActive 
                    ? (danger ? 'bg-red-500 border-red-400 text-white shadow-red-500/30' : activeClass) 
                    : inactiveClass}
            `}
        >
            {icon}
        </button>
        <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none border border-white/10">
            {label}
        </span>
    </div>
  );

  return (
    <div className="glass-panel px-6 py-4 rounded-3xl flex items-center gap-4 md:gap-6 shadow-2xl transform transition-transform hover:scale-[1.02]">
      
      <Button 
        onClick={onToggleMute}
        isActive={isMuted}
        label={isMuted ? "Unmute Mic" : "Mute Mic"}
        danger={false}
        activeClass="bg-red-500/20 border-red-500/50 text-red-500"
        inactiveClass="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
        icon={
            isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12"></path><path d="M15.002 6.16a3 3 0 0 0-2.12-2.12"></path></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
            )
        }
      />

      <Button 
        onClick={onToggleVideo}
        isActive={isVideoOff}
        label={isVideoOff ? "Start Video" : "Stop Video"}
        danger={false}
        activeClass="bg-red-500/20 border-red-500/50 text-red-500"
        inactiveClass="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
        icon={
            isVideoOff ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
            )
        }
      />

      {isInCall && (
         <>
            <div className="w-px h-8 bg-white/10 mx-1"></div>
            
            <Button
                onClick={onToggleStats}
                isActive={showStats}
                label="Net Stats"
                activeClass="bg-blue-500/20 border-blue-500/50 text-blue-400"
                inactiveClass="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                }
            />

            <Button
                onClick={onEndCall}
                isActive={true}
                danger={true}
                label="End Call"
                activeClass="bg-red-600 border-red-500 hover:bg-red-700"
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>
                }
            />
         </>
      )}
    </div>
  );
};

export default ControlBar;
