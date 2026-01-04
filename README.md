# Shaale - Kannada Learning App

A React Native iOS app for learning Kannada, companion to [shaale.ai](https://shaale.ai).

## Features

- **Video Streaming**: Watch educational videos for letters, rhymes, stories, and numbers
- **Binge Watch Mode**: Auto-advance through video series
- **Kannada Letters**: Interactive display of all 49 Kannada letters (vowels & consonants)
- **HLS Streaming**: Native support for Cloudflare Stream HLS playback

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Navigation**: Expo Router (file-based routing)
- **Video**: expo-av with native HLS support
- **Icons**: @expo/vector-icons (Ionicons)
- **Data**: CSV parsing from Supabase Storage

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. Expo Go app on your iPhone ([Download from App Store](https://apps.apple.com/app/expo-go/id982107779))

### Installation

```bash
# Clone the repository
git clone https://github.com/mirrorphotosintern/shaale-app.git
cd shaale-app

# Install dependencies
npm install
```

### Running on iPhone

1. Start the development server:
   ```bash
   npm start
   ```

2. You'll see a QR code in the terminal

3. On your iPhone:
   - Open the Camera app
   - Scan the QR code
   - Tap the notification to open in Expo Go

4. The app will build and load on your device!

### Running on Simulator

```bash
# iOS Simulator (requires Xcode)
npm run ios

# Android Emulator (requires Android Studio)
npm run android
```

## Project Structure

```
shaale-app/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home screen
│   │   ├── stream.tsx     # Video streaming
│   │   ├── letters.tsx    # Kannada letters
│   │   └── profile.tsx    # User profile
│   ├── player/            # Video player
│   │   └── [id].tsx       # Full-screen player
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable components
│   ├── services/          # API services
│   │   └── videos.ts      # Video data fetching
│   └── types/             # TypeScript types
│       └── videos.ts      # Video types
└── assets/                # Images and icons
```

## Building for Production

### Using EAS Build (Recommended)

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Login to Expo:
   ```bash
   eas login
   ```

3. Configure EAS:
   ```bash
   eas build:configure
   ```

4. Build for iOS:
   ```bash
   eas build --platform ios
   ```

### Local Development Build

For testing on your physical device without Expo Go:

```bash
# Generate native iOS project
npx expo prebuild

# Open in Xcode
open ios/shaaleapp.xcworkspace
```

Then build and run from Xcode to your device.

## Content Source

Videos are streamed from Cloudflare via the same infrastructure as the web app (shaale.ai). The video metadata is loaded from a CSV file in Supabase Storage.

## Coming Soon

- [ ] User authentication (Clerk)
- [ ] Progress tracking
- [ ] Interactive games (Padha Krama, Balloon Pop, etc.)
- [ ] Audio pronunciation
- [ ] AI-powered conversation practice
- [ ] Offline video downloads

## Related

- [Shaale.ai Web App](https://shaale.ai) - Full-featured web version
- [lk-check Repository](../lk-check) - Web app source code

## License

Private - All rights reserved.
