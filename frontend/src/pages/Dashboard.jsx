import React, { useState, useEffect } from 'react';
import { useDevices } from '../context/DeviceContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DeviceCard } from '../components/DeviceCard';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  Laptop,
  Smartphone,
  Sparkles,
  Zap,
  Activity,
  ShieldCheck,
  Globe,
  Folder,
  Code,
  Calculator,
  PlaySquare,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { user } = useAuth();
  const { devices, fetchDevices, showToast } = useDevices();
  const [recentLogs, setRecentLogs] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [confirmCommand, setConfirmCommand] = useState(null);

  useEffect(() => {
    loadRecentLogs();
  }, []);

  const loadRecentLogs = async () => {
    try {
      const res = await api.getActivityLogs();
      if (res.success) {
        setRecentLogs(res.data.slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickCommand = async (payload) => {
    setIsExecuting(true);
    try {
      const res = await api.executeCommand(payload);
      if (res.requires_confirmation) {
        setConfirmCommand(res.normalizedCommand);
      } else if (res.success) {
        showToast(res.message || 'Command dispatched to device', 'info');
        loadRecentLogs();
      }
    } catch (err) {
      showToast(err.message || 'Failed to dispatch command', 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleConfirmAction = async (command) => {
    try {
      const res = await api.executeCommand({
        ...command,
        confirmed: true
      });
      if (res.success) {
        showToast('Authorized action dispatched', 'success');
        loadRecentLogs();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const onlineLaptops = devices.filter((d) => d.type === 'laptop' && d.isOnline);
  const onlinePhones = devices.filter((d) => d.type === 'phone' && d.isOnline);

  const quickActions = [
    { label: 'Open Chrome', intent: 'OPEN_APP', deviceType: 'laptop', target: 'chrome', icon: Globe, color: 'text-cyan-400' },
    { label: 'Open VS Code', intent: 'OPEN_APP', deviceType: 'laptop', target: 'vscode', icon: Code, color: 'text-primary-400' },
    { label: 'Downloads Folder', intent: 'OPEN_FOLDER', deviceType: 'laptop', target: 'downloads', icon: Folder, color: 'text-amber-400' },
    { label: 'Calculator', intent: 'OPEN_APP', deviceType: 'laptop', target: 'calculator', icon: Calculator, color: 'text-emerald-400' },
    { label: 'Open YouTube', intent: 'OPEN_WEBSITE', deviceType: 'laptop', target: 'https://youtube.com', icon: PlaySquare, color: 'text-rose-400' },
    { label: 'Open WhatsApp', intent: 'OPEN_APP', deviceType: 'phone', target: 'whatsapp', icon: Smartphone, color: 'text-emerald-400' },
    { label: 'Lock Laptop', intent: 'LOCK_DEVICE', deviceType: 'laptop', target: 'lock', icon: Lock, color: 'text-amber-400', sensitive: true }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight flex items-center space-x-3">
            <span>Welcome back, {user?.name || 'Explorer'}</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Personal AI assistant ready to control your registered laptop and mobile devices.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/chat"
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-primary-600 to-accent-cyan hover:from-primary-500 hover:to-accent-cyan/90 text-white shadow-lg shadow-primary-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open AI Chat</span>
          </Link>
          <Link
            to="/voice"
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-dark-700 hover:bg-dark-600 text-gray-200 border border-white/5 transition-all"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Voice Mode</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel space-y-2 border border-white/5">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Online Devices</span>
            <Laptop className="w-4 h-4 text-primary-400" />
          </div>
          <div className="text-2xl font-heading font-bold text-white">
            {onlineLaptops.length + onlinePhones.length} <span className="text-sm font-normal text-gray-400">/ {devices.length}</span>
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{onlineLaptops.length} Laptop, {onlinePhones.length} Phone</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-2 border border-white/5">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>AI Inference Engine</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-heading font-bold text-white">Groq Llama 3.3</div>
          <p className="text-[11px] text-cyan-400 font-mono">Ultra-low latency JSON mode</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-2 border border-white/5">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Security Layer</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-heading font-bold text-emerald-400">Allowlist Active</div>
          <p className="text-[11px] text-gray-400">Zero arbitrary shell execution</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-2 border border-white/5">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Real-time Sync</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-heading font-bold text-white">WebSocket</div>
          <p className="text-[11px] text-indigo-400 font-mono">Port 5000 /ws (Encrypted)</p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-heading font-bold text-white flex items-center space-x-2">
            <Zap className="w-5 h-5 text-primary-400" />
            <span>Instant Quick Actions</span>
          </h2>
          <span className="text-xs text-gray-400">1-click direct device trigger</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                disabled={isExecuting}
                onClick={() =>
                  handleQuickCommand({
                    intent: action.intent,
                    deviceType: action.deviceType,
                    target: action.target
                  })
                }
                className="p-4 rounded-2xl glass-card flex flex-col items-center text-center space-y-2.5 group transition-all"
              >
                <div className={`p-3 rounded-xl bg-dark-800 border border-white/5 group-hover:scale-110 transition-all ${action.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-gray-200 block truncate">{action.label}</span>
                  <span className="text-[10px] text-gray-500 capitalize">{action.deviceType}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column: Registered Devices & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Devices Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-bold text-white">My Registered Devices</h2>
            <Link to="/devices" className="text-xs text-primary-400 hover:text-primary-300 flex items-center space-x-1">
              <span>Manage Devices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {devices.length === 0 ? (
            <div className="p-8 rounded-2xl glass-panel text-center space-y-3">
              <Laptop className="w-10 h-10 text-gray-600 mx-auto" />
              <p className="text-sm text-gray-400">No devices paired yet.</p>
              <Link
                to="/devices"
                className="inline-block px-4 py-2 rounded-xl text-xs font-semibold bg-primary-600 hover:bg-primary-500 text-white"
              >
                Pair Your Laptop / Phone
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {devices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onTestPing={() =>
                    handleQuickCommand({
                      deviceId: device.deviceId,
                      intent: 'GET_DEVICE_STATUS',
                      target: 'status'
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-bold text-white">Recent Activity</h2>
            <Link to="/activity" className="text-xs text-primary-400 hover:text-primary-300">
              View All
            </Link>
          </div>

          <div className="p-4 rounded-2xl glass-panel space-y-3">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No recent commands recorded</p>
            ) : (
              <div className="space-y-2.5">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-dark-900/60 border border-white/5 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-200 uppercase tracking-wide">
                        {log.intent?.replace(/_/g, ' ')}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : log.status === 'FAILED'
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 truncate">
                      {log.deviceName} • {log.target}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(confirmCommand)}
        command={confirmCommand}
        onClose={() => setConfirmCommand(null)}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
