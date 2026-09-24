import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { wsClient } from '../services/websocket';
import { useAuth } from './AuthContext';

const DeviceContext = createContext(null);

export function DeviceProvider({ children }) {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState('all'); // 'laptop' | 'phone' | 'all'
  const [toastMessage, setToastMessage] = useState(null);

  const fetchDevices = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.getDevices();
      if (res.success) {
        setDevices(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDevices();

      // Subscribe to WebSocket events
      const unsubscribe = wsClient.subscribe((msg) => {
        if (msg.type === 'DEVICE_STATUS_CHANGED') {
          const { deviceId, isOnline, name } = msg.payload || {};
          setDevices((prev) =>
            prev.map((d) => (d.deviceId === deviceId ? { ...d, isOnline } : d))
          );
          showToast(
            `${name || 'Device'} is now ${isOnline ? 'Online 🟢' : 'Offline 🔴'}`,
            isOnline ? 'info' : 'warning'
          );
        } else if (msg.type === 'COMMAND_COMPLETED') {
          const { status, result, error } = msg.payload || {};
          showToast(
            status === 'SUCCESS'
              ? `Action executed successfully: ${result?.message || 'Completed'}`
              : `Action failed: ${error || 'Unknown error'}`,
            status === 'SUCCESS' ? 'success' : 'error'
          );
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const getOnlineDevices = () => devices.filter((d) => d.isOnline);

  return (
    <DeviceContext.Provider
      value={{
        devices,
        loading,
        fetchDevices,
        selectedTarget,
        setSelectedTarget,
        getOnlineDevices,
        toastMessage,
        showToast
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
}

export const useDevices = () => useContext(DeviceContext);
