import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { DeviceModel } from '../models/Device.js';
import { ActivityLogModel } from '../models/ActivityLog.js';

export class WebSocketService {
  constructor() {
    this.wss = null;
    // Map of deviceId -> WebSocket connection
    this.deviceSockets = new Map();
    // Map of userId -> Set of WebSocket connections (web frontend clients)
    this.userSockets = new Map();
  }

  initialize(httpServer) {
    this.wss = new WebSocketServer({ server: httpServer, path: '/ws' });

    this.wss.on('connection', (ws, req) => {
      ws.isAlive = true;
      ws.clientType = 'unknown'; // 'agent' | 'user'

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', async (messageData) => {
        try {
          const message = JSON.parse(messageData.toString());
          await this.handleIncomingMessage(ws, message);
        } catch (err) {
          console.error('Error handling WebSocket message:', err.message);
          this.sendSafe(ws, { type: 'ERROR', error: 'Malformed message JSON' });
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      ws.on('error', (err) => {
        console.error('WebSocket client error:', err.message);
      });
    });

    // Heartbeat check every 30 seconds
    const interval = setInterval(() => {
      if (!this.wss) return;
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          this.handleDisconnect(ws);
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    this.wss.on('close', () => {
      clearInterval(interval);
    });

    console.log('⚡ WebSocket Server initialized on /ws');
  }

  async handleIncomingMessage(ws, message) {
    const { type, payload } = message;

    switch (type) {
      // 1. Device Agent Authenticates (Desktop or Android APK)
      case 'AGENT_AUTH': {
        const { deviceToken, deviceId, systemInfo } = payload || {};
        if (!deviceToken) {
          return this.sendSafe(ws, { type: 'AUTH_FAILED', error: 'Missing deviceToken' });
        }

        const device = DeviceModel.findByToken(deviceToken);
        if (!device) {
          return this.sendSafe(ws, { type: 'AUTH_FAILED', error: 'Invalid device token. Device not registered or revoked.' });
        }

        ws.clientType = 'agent';
        ws.deviceId = device.deviceId;
        ws.dbId = device.id;
        ws.userId = device.userId;
        ws.deviceType = device.type;

        this.deviceSockets.set(device.deviceId, ws);

        // Update device in DB as online
        DeviceModel.updateStatus(device.deviceId, true, {
          os: systemInfo?.os || device.os,
          platform: systemInfo?.platform || device.platform,
          capabilities: systemInfo?.capabilities || device.capabilities
        });

        this.sendSafe(ws, {
          type: 'AUTH_SUCCESS',
          payload: { message: `Device '${device.name}' authenticated successfully`, deviceId: device.deviceId }
        });

        // Notify user's web dashboards
        this.broadcastToUser(device.userId, {
          type: 'DEVICE_STATUS_CHANGED',
          payload: { deviceId: device.deviceId, isOnline: true, name: device.name, type: device.type }
        });

        console.log(`🔌 Agent connected: ${device.name} (${device.type}) [${device.deviceId}]`);
        break;
      }

      // 2. Web Client Authenticates via JWT
      case 'CLIENT_AUTH': {
        const { token } = payload || {};
        if (!token) {
          return this.sendSafe(ws, { type: 'AUTH_FAILED', error: 'Missing JWT token' });
        }

        try {
          const decoded = jwt.verify(token, config.JWT_SECRET);
          ws.clientType = 'user';
          ws.userId = decoded.id;

          if (!this.userSockets.has(decoded.id)) {
            this.userSockets.set(decoded.id, new Set());
          }
          this.userSockets.get(decoded.id).add(ws);

          this.sendSafe(ws, {
            type: 'AUTH_SUCCESS',
            payload: { message: 'Web client authenticated' }
          });
        } catch {
          this.sendSafe(ws, { type: 'AUTH_FAILED', error: 'Invalid or expired JWT token' });
        }
        break;
      }

      // 3. Agent Execution Result Response
      case 'COMMAND_EXECUTION_RESULT': {
        const { commandId, status, result, error } = payload || {};
        if (ws.clientType === 'agent' && commandId) {
          // Update Activity Log
          ActivityLogModel.updateStatus(commandId, status === 'SUCCESS' ? 'SUCCESS' : 'FAILED', {
            result,
            error,
            completedAt: new Date().toISOString()
          });

          // Forward result to Web UI
          if (ws.userId) {
            this.broadcastToUser(ws.userId, {
              type: 'COMMAND_COMPLETED',
              payload: {
                commandId,
                deviceId: ws.deviceId,
                status,
                result,
                error
              }
            });
          }
        }
        break;
      }

      // 4. Ping / Heartbeat from agent or client
      case 'PING': {
        this.sendSafe(ws, { type: 'PONG', timestamp: Date.now() });
        break;
      }

      default:
        break;
    }
  }

  handleDisconnect(ws) {
    if (ws.clientType === 'agent' && ws.deviceId) {
      this.deviceSockets.delete(ws.deviceId);
      DeviceModel.updateStatus(ws.deviceId, false);
      if (ws.userId) {
        this.broadcastToUser(ws.userId, {
          type: 'DEVICE_STATUS_CHANGED',
          payload: { deviceId: ws.deviceId, isOnline: false }
        });
      }
      console.log(`🔌 Agent disconnected: [${ws.deviceId}]`);
    } else if (ws.clientType === 'user' && ws.userId) {
      const set = this.userSockets.get(ws.userId);
      if (set) {
        set.delete(ws);
        if (set.size === 0) this.userSockets.delete(ws.userId);
      }
    }
  }

  /**
   * Send a command to a specific device agent
   */
  async sendCommandToDevice(deviceId, commandPayload) {
    const ws = this.deviceSockets.get(deviceId);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return {
        success: false,
        error: 'Target device is currently offline or unreachable.'
      };
    }

    try {
      this.sendSafe(ws, {
        type: 'EXECUTE_COMMAND',
        payload: commandPayload
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Broadcast message to all active web clients of a specific user
   */
  broadcastToUser(userId, message) {
    const clients = this.userSockets.get(userId);
    if (clients) {
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          this.sendSafe(client, message);
        }
      });
    }
  }

  sendSafe(ws, data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  isDeviceOnline(deviceId) {
    const ws = this.deviceSockets.get(deviceId);
    return Boolean(ws && ws.readyState === WebSocket.OPEN);
  }
}

export const websocketService = new WebSocketService();
