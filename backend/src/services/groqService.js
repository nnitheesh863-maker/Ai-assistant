import Groq from 'groq-sdk';
import { config } from '../config/env.js';
import { LAPTOP_APP_ALLOWLIST, PHONE_APP_ALLOWLIST, LAPTOP_FOLDER_ALLOWLIST } from '../../../shared/constants.js';

export class GroqService {
  constructor() {
    this.client = null;
    this.initClient();
  }

  initClient() {
    if (config.GROQ_API_KEY && config.GROQ_API_KEY.trim().length > 5) {
      try {
        this.client = new Groq({ apiKey: config.GROQ_API_KEY });
      } catch (err) {
        console.error('Failed to initialize Groq client:', err.message);
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  getSystemPrompt(registeredDevices = []) {
    const laptopApps = Object.keys(LAPTOP_APP_ALLOWLIST).join(', ');
    const phoneApps = Object.keys(PHONE_APP_ALLOWLIST).join(', ');
    const laptopFolders = Object.keys(LAPTOP_FOLDER_ALLOWLIST).join(', ');
    const devicesList = registeredDevices.length > 0 
      ? registeredDevices.map(d => `${d.name} (${d.type}, ${d.isOnline ? 'Online' : 'Offline'})`).join('; ')
      : 'Laptop (default), Phone (default)';

    return `You are an intelligent Personal Device Assistant capable of having friendly conversations and controlling authorized user devices (Laptop & Android Phone).

REGISTERED USER DEVICES:
${devicesList}

ALLOWED LAPTOP APPS: ${laptopApps}
ALLOWED PHONE APPS: ${phoneApps}
ALLOWED FOLDERS: ${laptopFolders}

YOUR RESPONSIBILITY:
1. When user engages in normal conversation, answer warmly, informatively, and concisely.
2. When user requests an action on their device (e.g. "open chrome", "open whatsapp on my phone", "open downloads folder", "check laptop status", "send message to Alice", "lock my laptop"):
   - Identify the user's intent.
   - Pick the target device ("laptop" or "phone"). If unspecified, infer from context or default to laptop for desktop apps/folders, and phone for mobile apps.
   - Return structured JSON inside the designated response schema.
3. Sensitive actions (sending messages, locking/sleeping devices) MUST have requires_confirmation: true.
4. If an action is clearly unsupported or ambiguous, explain politely in natural language and do not return an execution command.

CRITICAL OUTPUT FORMAT:
You MUST ALWAYS respond with a valid JSON object with the following shape:
{
  "reply": "Your natural language response to the user here.",
  "command": {
    "intent": "OPEN_APP" | "OPEN_WEBSITE" | "OPEN_FOLDER" | "GET_DEVICE_STATUS" | "SHOW_NOTIFICATION" | "SEND_MESSAGE" | "LOCK_DEVICE" | "SLEEP_DEVICE" | null,
    "device": "laptop" | "phone" | null,
    "target": "chrome" | "whatsapp" | "downloads" | "https://youtube.com" | null,
    "requires_confirmation": false,
    "params": {
      "title": "optional",
      "message": "optional",
      "recipient": "optional",
      "url": "optional"
    }
  }
}
If no device command is intended, set "command": null.
Output ONLY the JSON object, with no markdown code blocks or surrounding text.`;
  }

  /**
   * Process conversation with Groq AI or smart fallback parser
   */
  async processMessage(userMessage, conversationHistory = [], registeredDevices = []) {
    this.initClient();

    // If Groq API Key is available, use Groq model with JSON mode
    if (this.client) {
      try {
        const messages = [
          { role: 'system', content: this.getSystemPrompt(registeredDevices) },
          ...conversationHistory.slice(-8).map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
          })),
          { role: 'user', content: userMessage }
        ];

        const response = await this.client.chat.completions.create({
          model: config.GROQ_MODEL,
          messages,
          response_format: { type: 'json_object' },
          temperature: 0.2,
          max_tokens: 1000
        });

        const rawContent = response.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(rawContent);

        return {
          reply: parsed.reply || "I've processed your request.",
          command: parsed.command || null,
          source: 'groq'
        };
      } catch (err) {
        console.warn('Groq API call encountered an error, falling back to local NLP parser:', err.message);
      }
    }

    // Smart Local NLP / Regex Intent Parser (Fallback & Offline Mode)
    return this.fallbackNlpParser(userMessage, registeredDevices);
  }

  /**
   * High-accuracy heuristic & regex intent extractor for offline & keyless testing
   */
  fallbackNlpParser(text, registeredDevices = []) {
    const lower = text.toLowerCase().trim();

    // Determine target device
    let targetDevice = 'laptop';
    if (lower.includes('phone') || lower.includes('mobile') || lower.includes('android')) {
      targetDevice = 'phone';
    } else if (lower.includes('laptop') || lower.includes('pc') || lower.includes('computer') || lower.includes('desktop')) {
      targetDevice = 'laptop';
    }

    // 1. Open Folders
    for (const folder of Object.keys(LAPTOP_FOLDER_ALLOWLIST)) {
      if (lower.includes(`open ${folder}`) || lower.includes(`${folder} folder`)) {
        return {
          reply: `Opening your ${folder.toUpperCase()} folder on laptop.`,
          command: {
            intent: 'OPEN_FOLDER',
            device: 'laptop',
            target: folder,
            requires_confirmation: false,
            params: {}
          },
          source: 'local-nlp'
        };
      }
    }

    // 2. Open Websites
    const urlMatch = lower.match(/(?:open|browse|visit|go to)\s+(?:https?:\/\/)?(www\.[a-z0-9\-]+\.[a-z]{2,}|[a-z0-9\-]+\.(?:com|org|io|dev|net|edu|app))/i);
    if (urlMatch) {
      const url = urlMatch[1];
      return {
        reply: `Opening website ${url} on your ${targetDevice}.`,
        command: {
          intent: 'OPEN_WEBSITE',
          device: targetDevice,
          target: `https://${url}`,
          requires_confirmation: false,
          params: { url: `https://${url}` }
        },
        source: 'local-nlp'
      };
    }

    // Special site shortcuts (e.g., "open youtube", "open github")
    if (lower.includes('open youtube') || lower.includes('youtube')) {
      if (targetDevice === 'phone') {
        return {
          reply: 'Launching YouTube app on your phone.',
          command: { intent: 'OPEN_APP', device: 'phone', target: 'youtube', requires_confirmation: false, params: {} },
          source: 'local-nlp'
        };
      }
      return {
        reply: 'Opening YouTube in browser.',
        command: { intent: 'OPEN_WEBSITE', device: 'laptop', target: 'https://youtube.com', requires_confirmation: false, params: {} },
        source: 'local-nlp'
      };
    }

    // 3. Open Laptop / Phone Apps
    const allApps = { ...LAPTOP_APP_ALLOWLIST, ...PHONE_APP_ALLOWLIST };
    for (const [key, info] of Object.entries(allApps)) {
      if (lower.includes(`open ${key}`) || lower === key || lower.includes(`launch ${key}`) || lower.includes(`start ${key}`)) {
        let dev = targetDevice;
        if (!lower.includes('laptop') && !lower.includes('phone')) {
          if (PHONE_APP_ALLOWLIST[key] && !LAPTOP_APP_ALLOWLIST[key]) dev = 'phone';
          if (LAPTOP_APP_ALLOWLIST[key] && !PHONE_APP_ALLOWLIST[key]) dev = 'laptop';
        }

        return {
          reply: `Launching ${info.name} on your ${dev}.`,
          command: {
            intent: 'OPEN_APP',
            device: dev,
            target: key,
            requires_confirmation: false,
            params: {}
          },
          source: 'local-nlp'
        };
      }
    }

    // 4. Device Status
    if (lower.includes('status') || lower.includes('battery') || lower.includes('device info') || lower.includes('how is my')) {
      return {
        reply: `Querying status for your ${targetDevice}.`,
        command: {
          intent: 'GET_DEVICE_STATUS',
          device: targetDevice,
          target: 'status',
          requires_confirmation: false,
          params: {}
        },
        source: 'local-nlp'
      };
    }

    // 5. Sensitive action: Lock / Sleep
    if (lower.includes('lock my') || lower.includes('lock laptop') || lower.includes('lock phone')) {
      return {
        reply: `I need your confirmation before locking your ${targetDevice}.`,
        command: {
          intent: 'LOCK_DEVICE',
          device: targetDevice,
          target: 'lock',
          requires_confirmation: true,
          params: {}
        },
        source: 'local-nlp'
      };
    }

    // 6. Conversational fallback
    return {
      reply: `Hello! I'm your AI Personal Device Assistant. You can ask me questions or command your laptop and phone (e.g. "Open Chrome", "Open WhatsApp on my phone", "Open Downloads folder", "Open YouTube", or "Check laptop status").`,
      command: null,
      source: 'local-nlp'
    };
  }
}

export const groqService = new GroqService();
