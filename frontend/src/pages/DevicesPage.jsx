import React, { useState } from 'react';
import { useDevices } from '../context/DeviceContext';
import { api } from '../services/api';
import { DeviceCard } from '../components/DeviceCard';
import {
  Laptop,
  Smartphone,
  Plus,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
  Key,
  HelpCircle,
  X
} from 'lucide-react';

export function DevicesPage() {
  const { devices, loading, fetchDevices, showToast } = useDevices();
  const [pairingModalOpen, setPairingModalOpen] = useState(false);
  const [directModalOpen, setDirectModalOpen] = useState(false);
  const [pairingCode, setPairingCode] = useState(null);
  const [copied, setCopied] = useState(false);

  // Direct registration state
  const [directName, setDirectName] = useState('');
  const [directType, setDirectType] = useState('laptop');
  const [newDirectDevice, setNewDirectDevice] = useState(null);

  const handleGeneratePairingCode = async () => {
    try {
      const res = await api.generatePairingCode();
      if (res.success) {
        setPairingCode(res.data.code);
        setPairingModalOpen(true);
      }
    } catch (err) {
      showToast(err.message || 'Failed to generate pairing code', 'error');
    }
  };

  const handleCopyCode = () => {
    if (pairingCode) {
      navigator.clipboard.writeText(pairingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteDevice = async (id) => {
    if (window.confirm('Are you sure you want to revoke and remove this device?')) {
      try {
        const res = await api.deleteDevice(id);
        if (res.success) {
          showToast('Device deleted successfully', 'success');
          fetchDevices();
        }
      } catch (err) {
        showToast(err.message || 'Failed to delete device', 'error');
      }
    }
  };

  const handleDirectRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.registerDirectDevice({
        name: directName,
        type: directType,
        os: directType === 'laptop' ? 'Windows 11' : 'Android 14',
        platform: directType === 'laptop' ? 'desktop' : 'mobile'
      });

      if (res.success) {
        setNewDirectDevice(res.data);
        showToast('Device registered! Copy the token to your .env', 'success');
        fetchDevices();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-tight">
            Device Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Pair and manage authorized laptops and Android smartphones connected to your assistant.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDevices}
            disabled={loading}
            className="p-2.5 rounded-xl bg-dark-700 hover:bg-dark-600 text-gray-300 border border-white/5 transition-all"
            title="Refresh Devices"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setNewDirectDevice(null);
              setDirectModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-dark-700 hover:bg-dark-600 text-gray-200 border border-white/5 transition-all"
          >
            <Key className="w-4 h-4 text-cyan-400" />
            <span>Generate Token</span>
          </button>

          <button
            onClick={handleGeneratePairingCode}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-primary-600 to-accent-cyan hover:from-primary-500 hover:to-accent-cyan text-white shadow-lg shadow-primary-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Pair New Device</span>
          </button>
        </div>
      </div>

      {/* Device Cards Grid */}
      {devices.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-dark-700 flex items-center justify-center mx-auto text-gray-500">
            <Laptop className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-bold text-white">No Devices Paired Yet</h3>
            <p className="text-xs text-gray-400 mt-1">
              Connect your Windows laptop using the desktop agent or your Android smartphone with the APK agent.
            </p>
          </div>
          <button
            onClick={handleGeneratePairingCode}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-primary-600 hover:bg-primary-500 text-white shadow-md transition-all"
          >
            Get Pairing Code
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onDelete={handleDeleteDevice}
              onTestPing={async (d) => {
                try {
                  const res = await api.executeCommand({
                    deviceId: d.deviceId,
                    intent: 'GET_DEVICE_STATUS',
                    target: 'status'
                  });
                  if (res.success) {
                    showToast(`Status query dispatched to ${d.name}`, 'info');
                  }
                } catch (err) {
                  showToast(err.message, 'error');
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Pairing Code Modal */}
      {pairingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-dark-800 border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-heading font-bold text-white">Pair Your Device</h3>
                <p className="text-xs text-gray-400">Enter this one-time 6-digit code on your device</p>
              </div>
              <button
                onClick={() => setPairingModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 6-Digit Code Display */}
            <div className="p-6 rounded-2xl bg-dark-900 border border-primary-500/20 text-center space-y-3">
              <span className="text-4xl font-mono font-bold tracking-widest text-primary-400">
                {pairingCode}
              </span>
              <div className="flex items-center justify-center">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
                </button>
              </div>
              <p className="text-[11px] text-gray-500">Valid for 10 minutes</p>
            </div>

            {/* Instructions */}
            <div className="space-y-3 text-xs text-gray-300">
              <div className="p-3 rounded-xl bg-dark-900/60 border border-white/5 space-y-1">
                <span className="font-semibold text-white flex items-center space-x-1.5">
                  <Laptop className="w-3.5 h-3.5 text-primary-400" />
                  <span>On Windows Laptop:</span>
                </span>
                <p className="text-gray-400 text-[11px] font-mono">
                  cd desktop-agent &amp;&amp; npm run pair
                </p>
              </div>

              <div className="p-3 rounded-xl bg-dark-900/60 border border-white/5 space-y-1">
                <span className="font-semibold text-white flex items-center space-x-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>On Android Phone:</span>
                </span>
                <p className="text-gray-400 text-[11px]">
                  Open AI Device Agent app &rarr; Enter pairing code &rarr; Tap Pair.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setPairingModalOpen(false);
                fetchDevices();
              }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-dark-700 hover:bg-dark-600 text-white transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Direct Device Registration Modal */}
      {directModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-dark-800 border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-heading font-bold text-white">Manual Token Setup</h3>
                <p className="text-xs text-gray-400">Generate a permanent device token for .env config</p>
              </div>
              <button
                onClick={() => setDirectModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!newDirectDevice ? (
              <form onSubmit={handleDirectRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Device Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. My ThinkPad Laptop"
                    value={directName}
                    onChange={(e) => setDirectName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-dark-900 text-white text-xs border border-white/10 focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Device Type</label>
                  <select
                    value={directType}
                    onChange={(e) => setDirectType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-dark-900 text-white text-xs border border-white/10 focus:outline-none focus:border-primary-500"
                  >
                    <option value="laptop">Windows Laptop</option>
                    <option value="phone">Android Smartphone</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-primary-600 hover:bg-primary-500 text-white transition-all"
                >
                  Generate Device Credentials
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-dark-900 border border-white/5 space-y-2 text-gray-300">
                  <div className="text-[11px] text-gray-400 font-sans">Save these to desktop-agent/.env:</div>
                  <div className="text-primary-400 break-all select-all">
                    DEVICE_ID={newDirectDevice.deviceId}
                  </div>
                  <div className="text-cyan-400 break-all select-all">
                    DEVICE_TOKEN={newDirectDevice.deviceToken}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setDirectModalOpen(false);
                    fetchDevices();
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all font-sans"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
