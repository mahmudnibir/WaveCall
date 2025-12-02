
import React from 'react';
import { NetworkStats as StatsType } from '../types';

interface Props {
  stats: StatsType;
  onClose?: () => void;
}

const NetworkStats: React.FC<Props> = ({ stats, onClose }) => {
  const getSignalStrength = (quality: string) => {
    switch (quality) {
      case 'excellent': return 4;
      case 'good': return 3;
      case 'poor': return 2;
      case 'critical': return 1;
      default: return 0;
    }
  };

  const strength = getSignalStrength(stats.connectionQuality);

  return (
    <div className="absolute top-4 left-4 glass-panel p-4 rounded-xl text-xs font-mono shadow-2xl z-20 w-64 transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-blue-400 uppercase tracking-widest font-bold text-[10px]">Net Stats</h3>
        <div className="flex gap-1 items-end h-3">
          {[1, 2, 3, 4].map((bar) => (
             <div 
               key={bar} 
               className={`w-1 rounded-sm ${bar <= strength ? (strength < 2 ? 'bg-red-500' : 'bg-green-400') : 'bg-slate-700'}`}
               style={{ height: `${bar * 25}%` }}
             />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center border-b border-white/5 pb-1">
          <span className="text-slate-400">Bitrate</span>
          <span className="text-white font-medium">{stats.bitrate} <span className="text-slate-500 text-[10px]">kbps</span></span>
        </div>
        <div className="flex justify-between items-center border-b border-white/5 pb-1">
          <span className="text-slate-400">Ping</span>
          <span className={`${stats.rtt > 150 ? 'text-yellow-400' : 'text-white'} font-medium`}>
            {stats.rtt} <span className="text-slate-500 text-[10px]">ms</span>
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-white/5 pb-1">
          <span className="text-slate-400">Loss</span>
          <span className={`${stats.packetLoss > 0 ? 'text-orange-400' : 'text-white'} font-medium`}>
            {stats.packetLoss}
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-white/5 pb-1">
          <span className="text-slate-400">Res</span>
          <span className="text-white font-medium">{stats.resolution}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">FPS</span>
          <span className="text-white font-medium">{stats.frameRate}</span>
        </div>
      </div>
      
      {stats.connectionQuality === 'critical' && (
         <div className="mt-3 text-center text-red-400 bg-red-500/10 py-1 px-2 rounded border border-red-500/20">
            Unstable Network
         </div>
      )}
    </div>
  );
};

export default NetworkStats;
