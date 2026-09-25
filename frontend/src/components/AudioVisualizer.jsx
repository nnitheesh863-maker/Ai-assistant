import React from 'react';

export function AudioVisualizer({ isListening }) {
  if (!isListening) return null;
  return (
    <div className="flex items-center space-x-1 h-6 px-3 py-1 bg-primary-500/10 rounded-full border border-primary-500/20">
      <span className="w-1 h-3 bg-primary-400 rounded-full animate-pulse" />
      <span className="w-1 h-5 bg-primary-400 rounded-full animate-pulse" />
      <span className="text-[11px] font-mono text-primary-300 ml-2">Listening...</span>
    </div>
  );
}
