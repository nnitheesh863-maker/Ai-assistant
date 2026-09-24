import { getAuthToken } from './api.js';

class WebSocketClient {
  constructor() {
    this.ws = null;
    this.subscribers = new Set();
    this.reconnectTimer = null;
    this.isConnected = false;
  }

  connect() {
    const token = getAuthToken();
    if (!token) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.isConnected = true;
      // Authenticate Client with JWT
      this.send({
        type: 'CLIENT_AUTH',
        payload: { token }
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.notify(message);
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      this.scheduleReconnect();
    };

    this.ws.onerror = (err) => {
      console.error('Frontend WS error:', err);
    };
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (getAuthToken()) {
        this.connect();
      }
    }, 4000);
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(message) {
    this.subscribers.forEach((cb) => {
      try {
        cb(message);
      } catch (err) {
        console.error('Subscriber error:', err);
      }
    });
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) this.ws.close();
    this.isConnected = false;
  }
}

export const wsClient = new WebSocketClient();
