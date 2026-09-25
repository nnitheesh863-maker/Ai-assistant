import { useEffect } from 'react';

export function useKeyboardShortcuts({ onFocusChat, onToggleVoice }) {
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        onToggleVoice?.();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onFocusChat, onToggleVoice]);
}
