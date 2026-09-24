# 🤖 AI Personal Device Assistant (Laptop & Android Mobile)

A production-ready, full-stack AI Personal Device Assistant that allows you to control your **Windows Laptop** and **Android Mobile** via natural language chat and real-time voice commands through a web dashboard. Powered by **Groq Llama 3.3**, low-latency **WebSockets**, and a strict security **Allowlist Architecture**.

---

## 🌟 Key Features

1. **🧠 Groq AI Chat & Command Processing**
   - Natural conversational AI powered by **Groq Llama 3.3 (70B Versatile)** with structured JSON command extraction.
   - Intelligent offline NLP parser fallback if running without an API key.
   - Multi-device contextual routing (auto-selects laptop or phone based on command).

2. **🎙️ Real-time Voice Assistant**
   - Interactive audio visualizer with animated soundwaves and glowing orb.
   - Live speech-to-text transcription via Web Speech API.
   - Text-to-speech audio synthesis replies.
   - Manual Start/Stop controls with clear visual state indicators (*Listening, Processing, Speaking, Idle*).

3. **💻 Windows Desktop Agent**
   - Secure native background client for Windows 10/11.
   - Safe application launcher (*Chrome, VS Code, Calculator, Notepad, Spotify, Edge, Word, Excel, VLC*).
   - System folder launcher (*Downloads, Documents, Desktop, Pictures, Videos*).
   - Safe website opener (*Default browser integration*).
   - Live hardware status telemetry (*CPU, RAM, Uptime, Battery*).
   - Windows Native Toast Notifications (via PowerShell Runtime).

4. **📱 Android Device Agent (APK)**
   - Kotlin application with background foreground service for 24/7 connectivity.
   - Secure 6-digit one-time code device pairing.
   - Android package launcher (*WhatsApp, YouTube, Chrome, Google Maps, Camera, Calculator, Spotify, Gmail, Calendar, Messages*).
   - Safe URL browser launcher & push notification receiver.
   - Battery level & device model telemetry.

5. **🛡️ Enterprise Security & Human-In-The-Loop**
   - **Command Allowlisting**: Eliminates arbitrary shell execution. Only verified executables, apps, and folders can be invoked.
   - **Sensitive Action Approvals**: Actions like locking devices or sending messages require explicit modal confirmation.
   - **Encrypted WebSocket Architecture**: Device authentication tokens (`X-Device-Token`) and JWT session security.

---

## 🏗️ Project Architecture

```
ai-assistant/
├── backend/               # Node.js + Express + WebSocket + Groq AI Server
│   ├── src/
│   │   ├── config/        # Environment & JSON Database Storage
│   │   ├── controllers/   # Auth, Device, Command, Chat, Activity controllers
│   │   ├── middleware/    # JWT Auth, Zod Validator, Rate Limiters, Error Handlers
│   │   ├── models/        # User, Device, ActivityLog, Message
│   │   ├── routes/        # REST API endpoints
│   │   ├── services/      # GroqService, CommandValidator, WebSocketService, DeviceService
│   │   ├── app.js         # Express app factory
│   │   └── server.js      # Server entrypoint (HTTP + WebSocket /ws)
│   └── tests/             # Automated unit & security test suite
├── desktop-agent/         # Windows Desktop Agent
│   ├── src/
│   │   ├── actions/       # App launcher, folder opener, system telemetry, toast notifications
│   │   ├── security/      # Local defense-in-depth allowlist
│   │   ├── wsClient.js    # Auto-reconnecting WebSocket client
│   │   └── agent.js       # Interactive CLI pairing wizard & daemon
│   └── run-agent.bat      # 1-Click Windows starter
├── android/               # Android Native Agent (Kotlin)
│   ├── app/src/main/
│   │   ├── java/com/aiassistant/deviceagent/
│   │   │   ├── MainActivity.kt      # Pairing interface & status view
│   │   │   ├── WebSocketService.kt  # Persistent Background Foreground Service
│   │   │   ├── CommandExecutor.kt   # App intents & notification dispatcher
│   │   │   └── Allowlist.kt         # Mobile package allowlist
│   │   └── AndroidManifest.xml
│   └── README.md
├── frontend/              # Modern React + Vite + Tailwind CSS Dashboard
│   ├── src/
│   │   ├── components/    # Navbar, Sidebar, ActionCard, ConfirmationModal, VoiceVisualizer, Toast
│   │   ├── context/       # AuthContext, DeviceContext (Real-time WS sync)
│   │   ├── pages/         # Dashboard, Chat, Voice Assistant, Devices, Activity Log, Settings, Auth
│   │   └── services/      # Fetch API, WebSocket Client, Web Speech API
├── shared/                # Shared constants, intents, and allowlists
└── package.json           # Root workspace scripts
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (Tested on Node v24)
- **Windows OS**: for the Desktop Agent
- **Android Device / Emulator**: for the Mobile APK

---

### Step 1: Install Dependencies

From the root project directory, run:
```bash
npm run install:all
```
*(Or install individually: `cd backend && npm install`, `cd frontend && npm install`, `cd desktop-agent && npm install`)*

---

### Step 2: Configure Environment (Optional Groq Key)

Create your `backend/.env` file:
```env
PORT=5000
NODE_ENV=development
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
JWT_SECRET=ai-assistant-super-secret-jwt-key-2026
DEVICE_TOKEN_SECRET=device-pairing-secret-key-2026
CLIENT_URL=http://localhost:5173
```
> 💡 *Note: If `GROQ_API_KEY` is omitted, the assistant seamlessly switches to its built-in local NLP intent extraction engine so you can test immediately!*

---

### Step 3: Start the Backend & Web Dashboard

In terminal 1 (Start Backend):
```bash
npm run start:backend
```
*Backend runs at `http://localhost:5000` with WebSocket at `ws://localhost:5000/ws`.*

In terminal 2 (Start Frontend Web Dashboard):
```bash
npm run start:frontend
```
*Web dashboard opens at `http://localhost:5173`.*

Open your browser at [http://localhost:5173](http://localhost:5173), create your account or click **Auto-fill demo test credentials**.

---

### Step 4: Connect Your Windows Laptop (Desktop Agent)

1. Go to **Devices** on the Web Dashboard (`http://localhost:5173/devices`).
2. Click **Pair New Device** to reveal a 6-digit code (e.g. `583921`).
3. In a new terminal, launch the desktop agent pairing wizard:
   ```bash
   cd desktop-agent
   npm run pair
   ```
4. Enter the 6-digit pairing code when prompted.
5. The laptop will pair, save its device credentials to `desktop-agent/.env`, and connect immediately!
6. Next time, simply double click `desktop-agent/run-agent.bat` or run `npm run start:desktop`.

---

### Step 5: Connect Your Android Phone (APK Agent)

1. Open `android/` in Android Studio or build via command line:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
2. Install `app-debug.apk` onto your Android device or emulator.
3. Open the **AI Device Agent** app on your phone.
4. Enter your computer's local IP (e.g. `http://192.168.1.100:5000` or `http://10.0.2.2:5000` for Android emulator).
5. Enter the 6-digit code from the Web Dashboard and tap **Pair and Connect Device**.

---

## 💬 Example Natural Language Commands

| You Type or Speak | Target Device | Executed Action |
| :--- | :--- | :--- |
| *"Open Chrome"* | Laptop | Launches Google Chrome |
| *"Open VS Code"* | Laptop | Launches Visual Studio Code |
| *"Open Downloads folder"* | Laptop | Opens Windows Explorer at user's `Downloads` |
| *"Open YouTube"* | Laptop | Opens `https://youtube.com` in default browser |
| *"Open WhatsApp on my phone"* | Android Mobile | Launches `com.whatsapp` package |
| *"Open Calculator on laptop"* | Laptop | Launches Windows Calculator |
| *"How is my laptop doing?"* | Laptop | Fetches CPU, RAM & system uptime |
| *"Lock my laptop"* | Laptop | **Sensitive action** &rarr; Prompts confirmation modal before locking |

---

## 🛡️ Security Allowlist Reference

### Laptop Application Allowlist
- `chrome` &rarr; `chrome`
- `vs code` / `code` &rarr; `code`
- `calculator` / `calc` &rarr; `calc`
- `notepad` &rarr; `notepad`
- `spotify` &rarr; `spotify`
- `terminal` &rarr; `wt`
- `cmd` &rarr; `cmd`
- `file explorer` &rarr; `explorer`
- `edge` &rarr; `msedge`
- `word` &rarr; `winword`
- `excel` &rarr; `excel`
- `vlc` &rarr; `vlc`

### Laptop Folder Allowlist
- `Downloads`, `Documents`, `Desktop`, `Pictures`, `Music`, `Videos`

### Android Mobile App Allowlist
- `WhatsApp` (`com.whatsapp`)
- `YouTube` (`com.google.android.youtube`)
- `Chrome` (`com.android.chrome`)
- `Google Maps` (`com.google.android.apps.maps`)
- `Calculator` (`com.google.android.calculator`)
- `Camera` (`com.android.camera`)
- `Spotify` (`com.spotify.music`)
- `Gmail` (`com.google.android.gm`)
- `Calendar` (`com.google.android.calendar`)

---

## 🧪 Running Automated Tests

Run backend unit and security validation test suite:
```bash
npm run test:backend
```

Tests include:
- `CommandValidator`: Validates allowlisted apps, folders, and reject unauthorized executables.
- `Security`: Validates prevention of command injection and directory traversal.
- `Auth`: JWT signing and password hashing.

---

## 📄 License
MIT License. Built for personal device automation with safety-first architecture.
