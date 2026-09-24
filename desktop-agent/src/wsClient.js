import WebSocket from 'ws';
import { config } from './config.js';
import { launchApplication } from './actions/appLauncher.js';
import { openFolder } from './actions/folderLauncher.js';
import { openWebsite } from './actions/websiteLauncher.js';
import { getSystemInformation } from './actions/systemInfo.js';
import { showNotification } from './actions/notifier.js';

export class DesktopAgentClient {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectTimer = null;
    this.isManualClosed = false;
    this.pingTimer = null;
  }

  connect() {
    if (this.isManualClosed) return;

    console.log(`[WS] 🔌 Connecting to Assistant Server at ${config.WS_URL}...`);
    this.ws = new WebSocket(config.WS_URL);

    this.ws.on('open', () => {
      this.isConnected = true;
      console.log('[WS] ✅ Connected to WebSocket server.');

      // Authenticate with deviceToken
      const systemInfo = getSystemInformation();
      this.send('AGENT_AUTH', {
        deviceToken: config.DEVICE_TOKEN,
        deviceId: config.DEVICE_ID,
        systemInfo: {
          os: systemInfo.os,
          platform: 'desktop',
          hostname: systemInfo.hostname,
          cpuModel: systemInfo.cpuModel,
          cpuCores: systemInfo.cpuCores,
          memory: systemInfo.memory,
          capabilities: ['OPEN_APP', 'OPEN_WEBSITE', 'OPEN_FOLDER', 'GET_DEVICE_STATUS', 'SHOW_NOTIFICATION']
        }
      });

      // Start client heartbeat ping
      this.startHeartbeat();
    });

    this.ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        await this.handleMessage(message);
      } catch (err) {
        console.error('[WS] ❌ Failed to parse incoming WebSocket message:', err.message);
      }
    });

    this.ws.on('close', (code, reason) => {
      this.isConnected = false;
      this.stopHeartbeat();
      console.warn(`[WS] ⚠️ Disconnected from Assistant Server (Code: ${code}). Reconnecting in ${config.RECONNECT_INTERVAL_MS / 1000}s...`);
      this.scheduleReconnect();
    });

    this.ws.on('error', (err) => {
      console.error('[WS] ❌ WebSocket error:', err.message);
    });
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.pingTimer = setInterval(() => {
      if (this.isConnected) {
        this.send('PING', { timestamp: Date.now() });
      }
    }, 15000);
  }

  stopHeartbeat() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer || this.isManualClosed) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, config.RECONNECT_INTERVAL_MS);
  }

  async handleMessage(message) {
    const { type, payload } = message;

    switch (type) {
      case 'AUTH_SUCCESS':
        console.log(`[AUTH] 🎉 ${payload.message}`);
        console.log(`[STATUS] 🟢 Desktop Agent is ONLINE and waiting for commands...\n`);
        showNotification('AETHER AI Agent Online', 'Laptop agent is connected and ready.');
        break;

      case 'AUTH_FAILED':
        console.error(`[AUTH] 🚫 Authentication Failed: ${payload?.error || message.error}`);
        console.log('\nPlease verify your DEVICE_TOKEN in .env or run `npm run pair` with a pairing code.');
        break;

      case 'EXECUTE_COMMAND':
        await this.executeCommand(payload);
        break;

      case 'PONG':
        // Heartbeat ack
        break;

      default:
        break;
    }
  }

  async executeCommand(payload) {
    const { commandId, intent, target, params = {} } = payload || {};
    console.log(`\n======================================================`);
    console.log(`[COMMAND] ⚡ Received: [${intent}] Target: '${target}' (ID: ${commandId})`);

    const startTime = Date.now();
    let result = null;
    let error = null;

    try {
      switch (intent) {
        case 'OPEN_APP':
          result = await launchApplication(target);
          break;

        case 'OPEN_WEBSITE':
          result = await openWebsite(target);
          break;

        case 'OPEN_FOLDER':
          result = await openFolder(target);
          break;

        case 'GET_DEVICE_STATUS':
          result = getSystemInformation();
          console.log(`[EXECUTOR] System telemetry generated:`, result.memory);
          break;

        case 'SHOW_NOTIFICATION':
          result = await showNotification(params.title || 'AETHER Alert', params.message || target);
          break;

        case 'LOCK_DEVICE':
          result = await launchApplication('rundll32.exe user32.dll,LockWorkStation');
          break;

        default:
          throw new Error(`Unsupported intent '${intent}' for desktop agent.`);
      }

      console.log(`[EXECUTOR] ✅ SUCCESS in ${Date.now() - startTime}ms`);
      console.log(`======================================================\n`);

      this.send('COMMAND_EXECUTION_RESULT', {
        commandId,
        status: 'SUCCESS',
        result,
        executionTimeMs: Date.now() - startTime
      });
    } catch (err) {
      console.error(`[EXECUTOR] ❌ FAILED: ${err.message}`);
      console.log(`======================================================\n`);

      this.send('COMMAND_EXECUTION_RESULT', {
        commandId,
        status: 'FAILED',
        error: err.message,
        executionTimeMs: Date.now() - startTime
      });
    }
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  stop() {
    this.isManualClosed = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) this.ws.close();
  }
}
