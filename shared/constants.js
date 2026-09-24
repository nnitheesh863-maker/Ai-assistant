/**
 * Supported Intents across all clients and agents.
 */
export const INTENTS = {
  OPEN_APP: 'OPEN_APP',
  OPEN_WEBSITE: 'OPEN_WEBSITE',
  OPEN_FOLDER: 'OPEN_FOLDER',
  OPEN_FILE: 'OPEN_FILE',
  GET_DEVICE_STATUS: 'GET_DEVICE_STATUS',
  SHOW_NOTIFICATION: 'SHOW_NOTIFICATION',
  MEDIA_CONTROL: 'MEDIA_CONTROL',
  SYSTEM_VOLUME: 'SYSTEM_VOLUME',
  // Sensitive intents requiring explicit user confirmation
  SEND_MESSAGE: 'SEND_MESSAGE',
  LOCK_DEVICE: 'LOCK_DEVICE',
  SLEEP_DEVICE: 'SLEEP_DEVICE'
};

export const DEVICE_TYPES = {
  LAPTOP: 'laptop',
  PHONE: 'phone',
  TABLET: 'tablet',
  ALL: 'all'
};

export const COMMAND_STATUS = {
  PENDING: 'PENDING',
  AWAITING_CONFIRMATION: 'AWAITING_CONFIRMATION',
  SENT_TO_DEVICE: 'SENT_TO_DEVICE',
  EXECUTING: 'EXECUTING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  UNAUTHORIZED: 'UNAUTHORIZED'
};

export const SENSITIVE_INTENTS = [
  INTENTS.SEND_MESSAGE,
  INTENTS.LOCK_DEVICE,
  INTENTS.SLEEP_DEVICE
];

/**
 * Laptop App Allowlist Mapping (normalized target -> executable/command)
 */
export const LAPTOP_APP_ALLOWLIST = {
  'chrome': { name: 'Google Chrome', target: 'chrome', winCommand: 'chrome' },
  'google chrome': { name: 'Google Chrome', target: 'chrome', winCommand: 'chrome' },
  'vs code': { name: 'Visual Studio Code', target: 'code', winCommand: 'code' },
  'vscode': { name: 'Visual Studio Code', target: 'code', winCommand: 'code' },
  'visual studio code': { name: 'Visual Studio Code', target: 'code', winCommand: 'code' },
  'calculator': { name: 'Calculator', target: 'calc', winCommand: 'calc' },
  'calc': { name: 'Calculator', target: 'calc', winCommand: 'calc' },
  'notepad': { name: 'Notepad', target: 'notepad', winCommand: 'notepad' },
  'spotify': { name: 'Spotify', target: 'spotify', winCommand: 'spotify' },
  'terminal': { name: 'Windows Terminal', target: 'wt', winCommand: 'wt' },
  'cmd': { name: 'Command Prompt', target: 'cmd', winCommand: 'cmd' },
  'explorer': { name: 'File Explorer', target: 'explorer', winCommand: 'explorer' },
  'file explorer': { name: 'File Explorer', target: 'explorer', winCommand: 'explorer' },
  'edge': { name: 'Microsoft Edge', target: 'msedge', winCommand: 'msedge' },
  'microsoft edge': { name: 'Microsoft Edge', target: 'msedge', winCommand: 'msedge' },
  'word': { name: 'Microsoft Word', target: 'winword', winCommand: 'winword' },
  'excel': { name: 'Microsoft Excel', target: 'excel', winCommand: 'excel' },
  'powerpoint': { name: 'Microsoft PowerPoint', target: 'powerpnt', winCommand: 'powerpnt' },
  'vlc': { name: 'VLC Media Player', target: 'vlc', winCommand: 'vlc' }
};

/**
 * Phone App Allowlist Mapping (normalized target -> package or intent)
 */
export const PHONE_APP_ALLOWLIST = {
  'whatsapp': { name: 'WhatsApp', package: 'com.whatsapp' },
  'youtube': { name: 'YouTube', package: 'com.google.android.youtube' },
  'chrome': { name: 'Chrome', package: 'com.android.chrome' },
  'maps': { name: 'Google Maps', package: 'com.google.android.apps.maps' },
  'google maps': { name: 'Google Maps', package: 'com.google.android.apps.maps' },
  'calculator': { name: 'Calculator', package: 'com.google.android.calculator' },
  'camera': { name: 'Camera', package: 'com.android.camera' },
  'settings': { name: 'Settings', package: 'com.android.settings' },
  'spotify': { name: 'Spotify', package: 'com.spotify.music' },
  'gmail': { name: 'Gmail', package: 'com.google.android.gm' },
  'calendar': { name: 'Calendar', package: 'com.google.android.calendar' },
  'clock': { name: 'Clock', package: 'com.google.android.deskclock' },
  'messages': { name: 'Messages', package: 'com.google.android.apps.messaging' },
  'phone': { name: 'Phone/Dialer', package: 'com.google.android.dialer' },
  'photos': { name: 'Google Photos', package: 'com.google.android.apps.photos' }
};

/**
 * Laptop Folder Allowlist Mapping
 */
export const LAPTOP_FOLDER_ALLOWLIST = {
  'downloads': 'USERPROFILE\\Downloads',
  'download': 'USERPROFILE\\Downloads',
  'documents': 'USERPROFILE\\Documents',
  'document': 'USERPROFILE\\Documents',
  'desktop': 'USERPROFILE\\Desktop',
  'pictures': 'USERPROFILE\\Pictures',
  'music': 'USERPROFILE\\Music',
  'videos': 'USERPROFILE\\Videos'
};
