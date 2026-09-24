import React from 'react';
import { ShieldAlert, AlertTriangle, X } from 'lucide-react';

export function ConfirmationModal({ isOpen, onClose, onConfirm, command }) {
  if (!isOpen || !command) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-dark-800 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Action Confirmation</h3>
              <p className="text-xs text-gray-400">Security authorization required</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-dark-900/70 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Intent:</span>
            <span className="font-semibold text-amber-400 uppercase font-mono">{command.intent}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Target Device:</span>
            <span className="font-medium text-white capitalize">{command.device}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Target Action:</span>
            <span className="font-mono text-gray-200">{command.target || 'General Action'}</span>
          </div>
        </div>

        <div className="flex items-start space-x-2 text-xs text-gray-400 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            This action requires explicit user permission before the assistant sends it to your personal device.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5 border border-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(command);
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/20 transition-all"
          >
            Authorize & Execute
          </button>
        </div>
      </div>
    </div>
  );
}
