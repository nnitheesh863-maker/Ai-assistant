import React from 'react';

export function PairingModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="p-6 rounded-xl bg-dark-900 text-white max-w-sm w-full">
        <h3 className="font-bold mb-2">Pair Device</h3>
        <button onClick={onClose} className="mt-4 px-3 py-1 bg-primary-500 rounded text-xs">Close</button>
      </div>
    </div>
  );
}
