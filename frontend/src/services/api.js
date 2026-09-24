const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('ai_assistant_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('ai_assistant_token', token);
  } else {
    localStorage.removeItem('ai_assistant_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `HTTP error! status: ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),

  // Devices
  getDevices: () => request('/devices'),
  generatePairingCode: () => request('/devices/pairing-code', { method: 'POST' }),
  registerDirectDevice: (payload) => request('/devices/direct', { method: 'POST', body: JSON.stringify(payload) }),
  deleteDevice: (id) => request(`/devices/${id}`, { method: 'DELETE' }),

  // Chat
  sendChatMessage: (payload) => request('/chat', { method: 'POST', body: JSON.stringify(payload) }),
  getChatHistory: () => request('/chat/history'),
  clearChatHistory: () => request('/chat/history', { method: 'DELETE' }),

  // Commands
  executeCommand: (payload) => request('/commands', { method: 'POST', body: JSON.stringify(payload) }),

  // Activity
  getActivityLogs: () => request('/activity'),
  clearActivityLogs: () => request('/activity', { method: 'DELETE' })
};
