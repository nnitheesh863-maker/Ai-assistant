import React from 'react';
import { Cpu, Battery } from 'lucide-react';

export function DeviceResourceGauge({ cpu = 15, bat = 95 }) {
  return (
    <div className="flex items-center space-x-3 text-xs text-gray-400 font-mono">
      <span><Cpu className="w-3 h-3 inline text-cyan-400" /> {cpu}%</span>
      <span><Battery className="w-3 h-3 inline text-emerald-400" /> {bat}%</span>
    </div>
  );
}
