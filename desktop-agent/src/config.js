import dotenv from 'dotenv';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',
  WS_URL: process.env.WS_URL || 'ws://localhost:5000/ws',
  DEVICE_ID: process.env.DEVICE_ID || `laptop-${os.hostname().toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
  DEVICE_NAME: process.env.DEVICE_NAME || `${os.hostname()} (Windows Laptop)`,
  DEVICE_TOKEN: process.env.DEVICE_TOKEN || '',
  RECONNECT_INTERVAL_MS: 4000
};
