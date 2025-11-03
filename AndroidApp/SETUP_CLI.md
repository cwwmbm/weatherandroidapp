# Command-Line Android Development Setup

This guide helps you build Android apps from the command line in Cursor without Android Studio.

## Prerequisites

### 1. Install Java JDK

**Option A: Microsoft OpenJDK (Pre-built, no Xcode needed)**
```bash
brew install --cask microsoft-openjdk@17
```

**Option B: Azul Zulu JDK (Alternative pre-built)**
```bash
brew install --cask zulu@17
```

**Option C: Oracle JDK (Official)**
```bash
brew install --cask oracle-jdk@17
```

After installation, find your JDK location:
```bash
/usr/libexec/java_home -V
```

Add to your `~/.zshrc` (adjust path based on which JDK you installed):
```bash
# For Microsoft OpenJDK or most Homebrew-installed JDKs:
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH="$JAVA_HOME/bin:$PATH"
```

If `/usr/libexec/java_home` doesn't find it, set manually:
```bash
# Example for Microsoft OpenJDK:
export JAVA_HOME=/Library/Java/JavaVirtualMachines/microsoft-17.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
```

Reload shell:
```bash
source ~/.zshrc
```

Verify installation:
```bash
java -version
```

### 2. Install Android SDK Command-Line Tools

Using Homebrew:
```bash
brew install --cask android-commandlinetools
```

Or download manually from: https://developer.android.com/studio#command-tools

Set environment variables in `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
```

Accept Android licenses:
```bash
sdkmanager --licenses
```

Install required SDK components:
```bash
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

### 3. Verify Installation

```bash
java -version
adb version
```

## Building the App

Once set up, you can use these commands:

```bash
# Build the web app and sync with Android
npm run cap:sync

# Build Android APK (debug)
npm run cap:build

# Install to connected device/emulator
npm run cap:install

# Clean build
npm run cap:clean
```

## Running on Device/Emulator

### Connect Physical Device:
1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect via USB
4. Run `adb devices` to verify connection
5. Run `npm run cap:install` to install

### Create Emulator:
```bash
# List available system images
sdkmanager --list | grep system-images

# Install a system image (example)
sdkmanager "system-images;android-34;google_apis;x86_64"

# Create emulator
avdmanager create avd -n Pixel5 -k "system-images;android-34;google_apis;x86_64"

# Start emulator
emulator -avd Pixel5
```

## Notes

- The APK will be in `android/app/build/outputs/apk/debug/app-debug.apk`
- You can manually install the APK on any Android device
- For production builds, you'll need to set up signing (see Android docs)

