import http from 'http';
import { createApp } from './app.js';
import { config } from './config/env.js';
import { websocketService } from './services/websocketService.js';

const app = createApp();
const server = http.createServer(app);

// Attach WebSocket Server
websocketService.initialize(server);

server.listen(config.PORT, () => {
  console.log(`
  ======================================================
  🤖 AI Personal Device Assistant Backend Server Running
  ======================================================
  🌐 REST API:    http://localhost:${config.PORT}
  🔌 WebSocket:   ws://localhost:${config.PORT}/ws
  🧠 Groq Model:  ${config.GROQ_MODEL} (Key: ${config.GROQ_API_KEY ? 'Configured ✅' : 'Fallback NLP Mode ⚠️'})
  ======================================================
  `);
});

export default server;
