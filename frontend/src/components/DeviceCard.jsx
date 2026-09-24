import React from 'react';
import { Laptop, Smartphone, Trash2, Cpu, Battery, Clock, Wifi, HardDrive, Activity } from 'lucide-react';

export function DeviceCard({ device, onDelete, onTestPing }) {
  const isLaptop = device.type === 'laptop';
  const isOnline = device.isOnline;

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4 relative overflow-hidden group">
      {/* Top Banner & Status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`p-3 rounded-2xl ${
              isOnline
                ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                : 'bg-dark-700/60 text-gray-500 border border-white/5'
            }`}
          >
            {isLaptop ? <Laptop className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
          </div>
          <div>
            <h4 className="font-heading font-bold text-white text-base flex items-center space-x-2">
              <span>{device.name}</span>
            </h4>
            <p className="text-xs text-gray-400 capitalize">{device.os || device.type}</p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center space-x-1.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isOnline ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse' : 'bg-gray-600'
            }`}
          ></span>
          <span className={`text-xs font-semibold ${isOnline ? 'text-emerald-400' : 'text-gray-500'}`}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Real Hardware Telemetry Grid */}
      <div className="grid grid-cols-2 gap-2 bg-dark-900/60 p-3 rounded-xl border border-white/5 text-xs text-gray-300 font-mono">
        <div className="flex items-center space-x-2 truncate col-span-2">
          <Cpu className="w-3.5 h-3.5 text-primary-400 shrink-0" />
          <span className="truncate text-gray-400">{device.cpuModel || (isLaptop ? 'Intel / AMD Windows CPU' : 'ARM Octa-Core')}</span>
        </div>

        {device.memory && (
          <div className="flex items-center space-x-2">
            <HardDrive className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
            <span>RAM: {device.memory.usagePercent} ({device.memory.freeMB} MB Free)</span>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Wifi className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="truncate">{device.deviceId}</span>
        </div>

        <div className="flex items-center space-x-2 col-span-2 pt-1 border-t border-white/5 text-[11px] text-gray-400">
          <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          <span>Last Heartbeat: {device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString() : 'Never'}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => onTestPing?.(device)}
          disabled={!isOnline}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            isOnline
              ? 'bg-primary-600/10 hover:bg-primary-600/20 text-primary-400 border-primary-500/20'
              : 'bg-dark-800 text-gray-600 border-transparent cursor-not-allowed'
          }`}
        >
          Check Real Status
        </button>

        <button
          onClick={() => onDelete?.(device.id)}
          className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          title="Revoke / Delete Device"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
