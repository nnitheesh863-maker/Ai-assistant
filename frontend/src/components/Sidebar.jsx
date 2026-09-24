import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Mic,
  Cpu,
  History,
  Settings
} from 'lucide-react';
import { useDevices } from '../context/DeviceContext';

export function Sidebar() {
  const { devices } = useDevices();
  const onlineCount = devices.filter((d) => d.isOnline).length;

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/chat', label: 'AI Chatbot', icon: MessageSquare },
    { to: '/voice', label: 'Voice Assistant', icon: Mic },
    { to: '/devices', label: 'Devices', icon: Cpu, badge: `${onlineCount}/${devices.length}` },
    { to: '/activity', label: 'Activity Log', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-white/5 glass-panel flex flex-col justify-between py-6 px-4 shrink-0">
      <div className="space-y-6">
        <div className="px-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Navigation
          </p>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30 shadow-lg shadow-primary-500/10'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-dark-700 text-gray-300 font-mono border border-white/5">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Connected Agent Status Widget */}
      <div className="p-4 rounded-2xl bg-dark-800/80 border border-white/5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Agent Network</span>
          <span className="flex items-center space-x-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{onlineCount > 0 ? 'Active' : 'Standby'}</span>
          </span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          {onlineCount} of {devices.length} personal devices online and authenticated.
        </p>
      </div>
    </aside>
  );
}
