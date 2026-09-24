import React from 'react';
import { Laptop, Smartphone, CheckCircle, AlertCircle, Clock, ShieldCheck, Terminal, Cpu, ArrowRight } from 'lucide-react';

export function ActionCard({ command, result, onConfirm }) {
  if (!command) return null;

  const isLaptop = command.device === 'laptop';
  const isPendingConfirmation = result?.status === 'AWAITING_CONFIRMATION' || command.requires_confirmation;
  const isSuccess = result?.status === 'SUCCESS';
  const isFailed = result?.status === 'FAILED';
  const isExecuting = result?.status === 'SENT_TO_DEVICE' || result?.status === 'EXECUTING';

  return (
    <div className="mt-3 p-4 rounded-xl glass-card border border-white/10 space-y-3 bg-dark-900/80">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
            {isLaptop ? <Laptop className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-xs font-bold text-gray-200 uppercase tracking-wider font-mono">
              {command.intent?.replace(/_/g, ' ')}
            </div>
            <div className="text-[11px] text-gray-400">
              Target Device: <span className="text-primary-400 font-medium capitalize">{command.device}</span>
            </div>
          </div>
        </div>

        {/* Real Status Badge */}
        <div>
          {isSuccess && (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Executed Successfully</span>
            </span>
          )}
          {isFailed && (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Execution Failed</span>
            </span>
          )}
          {isExecuting && (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 animate-pulse">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>Executing on Device...</span>
            </span>
          )}
          {isPendingConfirmation && (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Approval Required</span>
            </span>
          )}
        </div>
      </div>

      {/* Target Details */}
      <div className="bg-dark-950/80 p-3 rounded-lg border border-white/5 space-y-1.5 text-xs font-mono">
        <div className="flex items-center justify-between text-gray-300">
          <div className="flex items-center space-x-2 truncate">
            <Terminal className="w-3.5 h-3.5 text-primary-400 shrink-0" />
            <span className="text-primary-300 truncate font-semibold">{command.target || command.displayName}</span>
          </div>
          {command.requires_confirmation && (
            <span className="text-[10px] text-amber-400 uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-500/10">Sensitive</span>
          )}
        </div>

        {/* Real execution message / path */}
        {result?.result?.message && (
          <div className="text-[11px] text-emerald-400/90 pt-1 border-t border-white/5">
            ✓ {result.result.message}
          </div>
        )}
      </div>

      {/* Failure Reason */}
      {result?.error && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-0.5">
          <span className="font-bold text-rose-400 block">Reason:</span>
          <span>{result.error}</span>
        </div>
      )}

      {/* Approval Button for Sensitive Intents */}
      {isPendingConfirmation && onConfirm && (
        <div className="pt-1 flex items-center justify-end space-x-2">
          <button
            onClick={() => onConfirm(command)}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md transition-all"
          >
            Authorize &amp; Execute
          </button>
        </div>
      )}
    </div>
  );
}
