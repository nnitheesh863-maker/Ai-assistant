import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useDevices } from '../context/DeviceContext';
import {
  History,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Laptop,
  Smartphone
} from 'lucide-react';

export function ActivityPage() {
  const { showToast } = useDevices();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getActivityLogs();
      if (res.success) {
        setLogs(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load activity logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (window.confirm('Are you sure you want to clear all activity logs?')) {
      try {
        const res = await api.clearActivityLogs();
        if (res.success) {
          setLogs([]);
          showToast('Activity logs cleared', 'success');
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.rawCommand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.deviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.intent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-tight flex items-center space-x-2">
            <History className="w-6 h-6 text-primary-400" />
            <span>Activity Audit Log</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time chronological record of all AI-dispatched device commands and execution statuses.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadLogs}
            disabled={loading}
            className="p-2.5 rounded-xl bg-dark-700 hover:bg-dark-600 text-gray-300 border border-white/5 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleClearLogs}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Log</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-dark-800/80 p-3 rounded-2xl border border-white/5">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search commands, devices, targets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-900 text-white placeholder-gray-500 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-primary-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-dark-900 text-gray-200 text-xs rounded-xl px-3 py-2 border border-white/10 focus:outline-none focus:border-primary-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="SENT_TO_DEVICE">SENT_TO_DEVICE</option>
            <option value="FAILED">FAILED</option>
            <option value="AWAITING_CONFIRMATION">AWAITING_CONFIRMATION</option>
          </select>
        </div>
      </div>

      {/* Activity Table */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-dark-900/80 uppercase font-mono text-[11px] text-gray-400 border-b border-white/5">
              <tr>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4">Device</th>
                <th className="py-3.5 px-4">Intent</th>
                <th className="py-3.5 px-4">Target</th>
                <th className="py-3.5 px-4">Raw Query</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">
                    No activity logs matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isLaptop = log.deviceType === 'laptop';
                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-all">
                      <td className="py-3.5 px-4 font-mono text-gray-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {isLaptop ? (
                            <Laptop className="w-3.5 h-3.5 text-primary-400" />
                          ) : (
                            <Smartphone className="w-3.5 h-3.5 text-accent-cyan" />
                          )}
                          <span className="font-medium text-white">{log.deviceName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-300 uppercase">
                        {log.intent}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-primary-300 truncate max-w-[160px]">
                        {log.target}
                      </td>
                      <td className="py-3.5 px-4 text-gray-400 truncate max-w-[200px]">
                        "{log.rawCommand}"
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : log.status === 'FAILED'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : log.status === 'SENT_TO_DEVICE'
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {log.status === 'SUCCESS' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {log.status === 'FAILED' && <AlertCircle className="w-3 h-3 mr-1" />}
                          {log.status === 'SENT_TO_DEVICE' && <Clock className="w-3 h-3 mr-1 animate-spin" />}
                          <span>{log.status}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
