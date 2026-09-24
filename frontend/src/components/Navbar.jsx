import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useDevices } from '../context/DeviceContext';
import { Laptop, Smartphone, Radio, Sparkles, LogOut } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const { devices, selectedTarget, setSelectedTarget } = useDevices();

  const laptopCount = devices.filter((d) => d.type === 'laptop' && d.isOnline).length;
  const phoneCount = devices.filter((d) => d.type === 'phone' && d.isOnline).length;

  return (
    <header className="h-16 border-b border-white/5 glass-panel px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & AI Indicator */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-cyan flex items-center justify-center shadow-lg shadow-primary-500/20">
          <Sparkles className="w-5 h-5 text-white animate-pulse-slow" />
        </div>
        <div>
          <span className="font-heading font-bold text-lg tracking-wide bg-gradient-to-r from-white via-gray-200 to-primary-400 bg-clip-text text-transparent">
            AETHER AI
          </span>
          <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 font-medium border border-primary-500/20">
            Device Controller
          </span>
        </div>
      </div>

      {/* Target Device Selector */}
      <div className="flex items-center space-x-2 bg-dark-800/80 p-1 rounded-xl border border-white/5">
        <button
          onClick={() => setSelectedTarget('all')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            selectedTarget === 'all'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>All Devices</span>
        </button>

        <button
          onClick={() => setSelectedTarget('laptop')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            selectedTarget === 'laptop'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Laptop</span>
          {laptopCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setSelectedTarget('phone')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            selectedTarget === 'phone'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Phone</span>
          {phoneCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          )}
        </button>
      </div>

      {/* User Info & Logout */}
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-xs font-semibold text-gray-200">{user?.name}</span>
          <span className="text-[11px] text-gray-400">{user?.email}</span>
        </div>
        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 rounded-lg bg-dark-700/60 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 border border-white/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
