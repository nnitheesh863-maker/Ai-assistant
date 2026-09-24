/**
 * Local defense-in-depth allowlist for Windows Desktop Agent.
 * Even if backend commands are modified, the local agent enforces strict validation.
 */

export const ALLOWED_WIN_COMMANDS = new Set([
  'chrome',
  'code',
  'calc',
  'notepad',
  'spotify',
  'wt',
  'cmd',
  'explorer',
  'msedge',
  'winword',
  'excel',
  'powerpnt',
  'vlc'
]);

export const ALLOWED_SPECIAL_FOLDERS = new Set([
  'USERPROFILE\\Downloads',
  'USERPROFILE\\Documents',
  'USERPROFILE\\Desktop',
  'USERPROFILE\\Pictures',
  'USERPROFILE\\Music',
  'USERPROFILE\\Videos'
]);

export function isCommandAllowed(command) {
  if (!command || typeof command !== 'string') return false;
  const clean = command.trim().toLowerCase();
  return ALLOWED_WIN_COMMANDS.has(clean);
}

export function isFolderAllowed(folderPath) {
  if (!folderPath || typeof folderPath !== 'string') return false;
  return ALLOWED_SPECIAL_FOLDERS.has(folderPath);
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
