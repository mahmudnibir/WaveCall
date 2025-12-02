import React from 'react';
import { NetworkStats as StatsType } from '../types';

interface Props {
  stats: StatsType;
}

const NetworkStats: React.FC<Props> = ({ stats }) => {
  const getColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-yellow-400';
      case 'poor': return 'text-orange-400';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm p-3 rounded-lg text-xs font-mono border border-white/10 shadow-lg pointer-events-none z-10">
      <h3 className="text-gray-400 mb-1 uppercase tracking-wider font-bold">Network Monitor</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <span className="text-gray-400">Status:</span>
        <span className={`${getColor(stats.connectionQuality)} font-bold uppercase`}>
          {stats.connectionQuality}
        </span>

        <span className="text-gray-400">Bitrate:</span>
        <span className="text-white">{stats.bitrate} kbps</span>

        <span className="text-gray-400">RTT:</span>
        <span className="text-white">{stats.rtt} ms</span>

        <span className="text-gray-400">Loss:</span>
        <span className="text-white">{stats.packetLoss} pkts</span>

        <span className="text-gray-400">Res:</span>
        <span className="text-white">{stats.resolution}</span>

        <span className="text-gray-400">FPS:</span>
        <span className="text-white">{stats.frameRate}</span>
      </div>
    </div>
  );
};

export default NetworkStats;
