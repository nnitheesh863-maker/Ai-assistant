# Android Device Agent for AI Personal Assistant

This is the Android Agent client for the AI Personal Device Assistant. It allows you to control your Android smartphone or tablet securely through the central web dashboard and Groq AI voice/chat assistant.

## Features
- Secure device pairing via 6-digit one-time code.
- Background persistent WebSocket connection with auto-reconnect.
- Strict package allowlist (`WhatsApp`, `YouTube`, `Chrome`, `Maps`, `Spotify`, `Gmail`, etc.).
- Safe Intent launcher for apps and verified web URLs.
- Device status reporting (Battery level, OS version, device model).
- Push notification receiver.
- Confirmation requirement for sensitive actions.

## Building and Running the APK

### Prerequisites
- Android Studio Hedgehog (2023.1.1) or newer / Android SDK Build Tools 34
- JDK 17+

### Option 1: Build APK via Command Line
```bash
cd android
./gradlew assembleDebug
```
The compiled APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

### Option 2: Open in Android Studio
1. Open Android Studio.
2. Select **Open** and choose the `android` folder.
3. Allow Gradle to sync.
4. Click **Run > Run 'app'** or connect your physical Android phone via USB (with USB Debugging enabled).

## Connecting Your Android Phone
1. Open the AI Assistant Web Dashboard on your computer: `http://localhost:5173/devices`.
2. Click **Pair New Device** to generate a 6-digit pairing code (e.g. `482910`).
3. Open the **AI Device Agent** app on your phone.
4. Enter your computer's local IP (e.g., `http://192.168.1.100:5000` or `http://10.0.2.2:5000` for Android Emulator).
5. Enter the 6-digit pairing code and tap **Pair and Connect Device**.
6. Your phone is now online and ready to receive AI voice and chat commands!
