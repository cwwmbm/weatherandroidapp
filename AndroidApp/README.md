## Weather Forecast App

Weather forecast app for web and Android using Open-Meteo (no API key required).

### Features
- Daily and hourly weather forecasts
- City search functionality
- Responsive design for web and mobile
- Data source: https://open-meteo.com/

### Getting Started

Requirements:
- Node.js 18+
- For Android development: Android Studio and Java JDK

Install dependencies:
```bash
npm install
```

#### Web Development

Start the dev server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

#### Android Development

Build and sync with Android project:
```bash
npm run cap:sync
```

Open Android project in Android Studio:
```bash
npm run cap:open
```

Build, sync, and run on device/emulator:
```bash
npm run cap:run
```

**Android Setup:**

**Option 1: With Android Studio (Easiest)**
1. Install [Android Studio](https://developer.android.com/studio)
2. Run `npm run cap:open` to open in Android Studio
3. Build and run from Android Studio

**Option 2: Command-Line Only (No IDE)**
See `SETUP_CLI.md` for detailed instructions. Requires:
- Java JDK 17+
- Android SDK command-line tools
- Then use: `npm run cap:build` and `npm run cap:install`

### Notes
- No API keys required! Uses free Open-Meteo API
- Units are Celsius and mm
- Supports both web and native Android app from the same codebase
- To add iOS support later: `npm install @capacitor/ios && npx cap add ios`

