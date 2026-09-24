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
  }

  connect() {
    if (this.isManualClosed) return;

    console.log(`🔌 Connecting to Assistant Server at ${config.WS_URL}...`);
    this.ws = new WebSocket(config.WS_URL);

    this.ws.on('open', () => {
      this.isConnected = true;
      console.log('✅ Connected to WebSocket server.');

      // Authenticate with deviceToken
      const systemInfo = getSystemInformation();
      this.send('AGENT_AUTH', {
        deviceToken: config.DEVICE_TOKEN,
        deviceId: config.DEVICE_ID,
        systemInfo: {
          os: systemInfo.os,
          platform: 'desktop',
          capabilities: ['OPEN_APP', 'OPEN_WEBSITE', 'OPEN_FOLDER', 'GET_DEVICE_STATUS', 'SHOW_NOTIFICATION']
        }
      });
    });

    this.ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        await this.handleMessage(message);
      } catch (err) {
        console.error('❌ Failed to parse incoming WebSocket message:', err.message);
      }
    });

    this.ws.on('close', (code, reason) => {
      this.isConnected = false;
      console.warn(`⚠️ Disconnected from Assistant Server (Code: ${code}). Reconnecting in ${config.RECONNECT_INTERVAL_MS / 1000}s...`);
      this.scheduleReconnect();
    });

    this.ws.on('error', (err) => {
      console.error('❌ WebSocket error:', err.message);
    });
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
        console.log(`🎉 Authenticated: ${payload.message}`);
        showNotification('AI Assistant Connected', 'Laptop agent is online and ready for commands.');
        break;

      case 'AUTH_FAILED':
        console.error(`🚫 Authentication Failed: ${payload?.error || message.error}`);
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
    console.log(`\n⚡ Received Command: [${intent}] Target: '${target}'`);

    const startTime = Date.now();
    let result = null;
    let error = null;

    try {
      switch (intent) {
        case 'OPEN_APP':
          result = await launchApplication(target);
          showNotification('Application Opened', `Launched ${target}`);
          break;

        case 'OPEN_WEBSITE':
          result = await openWebsite(target);
          showNotification('Website Opened', `Opened ${target}`);
          break;

        case 'OPEN_FOLDER':
          result = await openFolder(target);
          showNotification('Folder Opened', `Opened folder: ${target}`);
          break;

        case 'GET_DEVICE_STATUS':
          result = getSystemInformation();
          break;

        case 'SHOW_NOTIFICATION':
          result = await showNotification(params.title || 'Alert', params.message || target);
          break;

        case 'LOCK_DEVICE':
          // Sensitive command execution upon approval
          result = await launchApplication('rundll32.exe user32.dll,LockWorkStation');
          break;

        default:
          throw new Error(`Unsupported intent '${intent}' for desktop agent.`);
      }

      console.log(`✅ Execution SUCCESS in ${Date.now() - startTime}ms`);

      this.send('COMMAND_EXECUTION_RESULT', {
        commandId,
        status: 'SUCCESS',
        result,
        executionTimeMs: Date.now() - startTime
      });
    } catch (err) {
      console.error(`❌ Execution FAILED: ${err.message}`);
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
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) this.ws.close();
  }
}
