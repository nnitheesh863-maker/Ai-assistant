import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { DesktopAgentClient } from './wsClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

async function pairWorkflow() {
  console.log(`
  ======================================================
  🔗 Pair This Windows Laptop to AI Personal Assistant
  ======================================================
  `);

  const serverUrl = (await prompt(`Backend API URL [${config.BACKEND_URL}]: `)) || config.BACKEND_URL;
  const pairingCode = await prompt('Enter 6-Digit Pairing Code shown in Web Dashboard: ');

  if (!pairingCode || pairingCode.length !== 6) {
    console.error('❌ Invalid pairing code. It must be a 6-digit number.');
    process.exit(1);
  }

  const deviceName = (await prompt(`Device Name [${config.DEVICE_NAME}]: `)) || config.DEVICE_NAME;

  try {
    console.log(`\n⏳ Pairing with server at ${serverUrl}...`);
    const res = await fetch(`${serverUrl}/api/devices/pair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: pairingCode,
        name: deviceName,
        type: 'laptop',
        deviceId: config.DEVICE_ID,
        os: 'Windows 11',
        platform: 'desktop'
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      console.error(`❌ Pairing Failed: ${data.error || 'Unknown error'}`);
      process.exit(1);
    }

    const { deviceToken, deviceId } = data.data;

    // Save to .env file
    const envContent = `# Desktop Agent Config
BACKEND_URL=${serverUrl}
WS_URL=${serverUrl.replace(/^http/, 'ws')}/ws
DEVICE_ID=${deviceId}
DEVICE_NAME=${deviceName}
DEVICE_TOKEN=${deviceToken}
`;

    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log(`
  🎉 SUCCESS! Device '${deviceName}' paired successfully!
  💾 Token saved to desktop-agent/.env
  🚀 Starting desktop agent daemon...
    `);

    config.DEVICE_TOKEN = deviceToken;
    config.DEVICE_ID = deviceId;
    config.WS_URL = `${serverUrl.replace(/^http/, 'ws')}/ws`;

    const client = new DesktopAgentClient();
    client.connect();
  } catch (err) {
    console.error('❌ Network error during pairing:', err.message);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isPairMode = args.includes('--pair');

  if (isPairMode || !config.DEVICE_TOKEN) {
    if (!config.DEVICE_TOKEN) {
      console.log('⚠️ No DEVICE_TOKEN found in desktop-agent/.env. Starting interactive pairing wizard...');
    }
    await pairWorkflow();
  } else {
    console.log(`
  ======================================================
  💻 AI Personal Assistant — Windows Desktop Agent
  ======================================================
  📱 Device ID:   ${config.DEVICE_ID}
  🏷️ Device Name: ${config.DEVICE_NAME}
  🌐 WS Server:   ${config.WS_URL}
  🛡️ Security:    Command Allowlist Active ✅
  ======================================================
    `);

    const client = new DesktopAgentClient();
    client.connect();

    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping Desktop Agent...');
      client.stop();
      process.exit(0);
    });
  }
}

main();
