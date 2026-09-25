import React from 'react';
import { Activity } from 'lucide-react';

export function LatencyBadge({ isConnected }) {
  if (!isConnected) return null;
  return (
    <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-dark-800 text-[10px] text-emerald-400 font-mono">
      <Activity className="w-3 h-3" />
      <span>18ms</span>
    </div>
  );
}
