import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory or root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODEL: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  JWT_SECRET: process.env.JWT_SECRET || 'ai-assistant-super-secret-jwt-key-2026',
  DEVICE_TOKEN_SECRET: process.env.DEVICE_TOKEN_SECRET || 'device-pairing-secret-key-2026',
  JWT_EXPIRES_IN: '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DB_PATH: process.env.DB_PATH || path.resolve(__dirname, '../../data/storage.json')
};
