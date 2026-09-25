/**
 * Local defense-in-depth allowlist for Windows Desktop Agent.
 * Even if backend commands are modified, the local agent enforces strict validation.
 */

export const ALLOWED_WIN_COMMANDS = new Set([
  'chrome',
  'google chrome',
  'code',
  'vscode',
  'vs code',
  'calc',
  'calculator',
  'notepad',
  'spotify',
  'wt',
  'terminal',
  'cmd',
  'explorer',
  'file explorer',
  'msedge',
  'edge',
  'winword',
  'word',
  'excel',
  'powerpnt',
  'powerpoint',
  'vlc'
]);

export const ALLOWED_SPECIAL_FOLDERS = new Set([
  'downloads',
  'documents',
  'desktop',
  'pictures',
  'music',
  'videos'
]);

export function isCommandAllowed(command) {
  if (!command || typeof command !== 'string') return false;
  const clean = command.trim().toLowerCase();
  return ALLOWED_WIN_COMMANDS.has(clean);
}

export const isAppAllowed = isCommandAllowed;

export function isFolderAllowed(folderPath) {
  if (!folderPath || typeof folderPath !== 'string') return false;
  const clean = folderPath.trim().toLowerCase().replace(/^userprofile[\\/]/i, '').replace(/^[\\/]/, '');
  return ALLOWED_SPECIAL_FOLDERS.has(clean);
}

export function isUrlAllowed(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
