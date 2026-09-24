import React from 'react';
import { useDevices } from '../context/DeviceContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export function Toast() {
  const { toastMessage } = useDevices();
  if (!toastMessage) return null;

  const { message, type } = toastMessage;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-primary-400 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-500/30 bg-dark-800/95 text-emerald-100',
    error: 'border-rose-500/30 bg-dark-800/95 text-rose-100',
    warning: 'border-amber-500/30 bg-dark-800/95 text-amber-100',
    info: 'border-primary-500/30 bg-dark-800/95 text-cyan-100'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div
        className={`flex items-center space-x-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl ${
          borders[type] || borders.info
        }`}
      >
        {icons[type] || icons.info}
        <span className="text-xs font-medium">{message}</span>
      </div>
    </div>
  );
}
