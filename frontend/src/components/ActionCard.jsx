import React from 'react';
import { Laptop, Smartphone, CheckCircle, AlertCircle, Clock, ShieldCheck, Terminal } from 'lucide-react';

export function ActionCard({ command, result, onConfirm }) {
  if (!command) return null;

  const isLaptop = command.device === 'laptop';
  const isPendingConfirmation = result?.status === 'AWAITING_CONFIRMATION' || command.requires_confirmation;
  const isSuccess = result?.status === 'SUCCESS';
  const isFailed = result?.status === 'FAILED';
  const isSent = result?.status === 'SENT_TO_DEVICE';

  return (
    <div className="mt-3 p-4 rounded-xl glass-card border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20">
            {isLaptop ? <Laptop className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-200 uppercase tracking-wider">
              {command.intent?.replace(/_/g, ' ')}
            </div>
            <div className="text-[11px] text-gray-400">
              Target Device: <span className="text-primary-400 font-medium capitalize">{command.device}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isSuccess && (
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Executed</span>
            </span>
          )}
          {isFailed && (
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Failed</span>
            </span>
          )}
          {isSent && (
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>Sent</span>
            </span>
          )}
          {isPendingConfirmation && (
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Approval Required</span>
            </span>
          )}
        </div>
      </div>

      {/* Target Details */}
      <div className="bg-dark-900/60 p-2.5 rounded-lg border border-white/5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2 text-gray-300">
          <Terminal className="w-3.5 h-3.5 text-primary-400" />
          <span className="truncate max-w-[280px]">{command.target || command.displayName || 'Action'}</span>
        </div>
        {command.requires_confirmation && (
          <span className="text-[10px] text-amber-400 uppercase font-semibold">Sensitive</span>
        )}
      </div>

      {/* Execution / Error notes */}
      {result?.error && (
        <p className="text-xs text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
          {result.error}
        </p>
      )}

      {/* Approval Button for Sensitive Intents */}
      {isPendingConfirmation && onConfirm && (
        <div className="pt-1 flex items-center justify-end space-x-2">
          <button
            onClick={() => onConfirm(command)}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md transition-all"
          >
            Confirm & Execute
          </button>
        </div>
      )}
    </div>
  );
}
