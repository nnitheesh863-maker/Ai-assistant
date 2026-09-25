import React from 'react';
import { Sparkles } from 'lucide-react';

export function QuickPrompts({ onSelect }) {
  return (
    <div className="p-3 rounded-xl bg-dark-900 border border-white/5 text-xs text-gray-400">
      <Sparkles className="w-3 h-3 text-primary-400 inline mr-1" /> Quick Actions
    </div>
  );
}
