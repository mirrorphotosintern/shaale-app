# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shaale is a React Native / Expo app for learning Kannada (a South Indian language). The app has two main features:
- **Stream**: Video content organized by categories (rhymes, stories, numbers, letters) with binge-watch functionality
- **Learn**: Interactive Kannada typewriter with three modes (Play, Akshara, Ottakshara) for learning letters and forming words

## Development Commands

```bash
# Start the Expo development server
npm start

# Run on specific platforms
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Web browser

# Generate native project files
npm run prebuild

# Build with EAS
npm run build:ios
npm run build:android
```

## Architecture

### Routing (expo-router)
- `app/_layout.tsx` - Root layout with Stack navigator
- `app/(tabs)/_layout.tsx` - Tab navigator with Stream and Learn tabs
- `app/(tabs)/index.tsx` - Stream tab (video grid)
- `app/(tabs)/letters.tsx` - Learn tab (Kannada typewriter)
- `app/player/[id].tsx` - Full-screen video player modal

### Data Layer
- `src/services/videos.ts` - Fetches video data from CSV hosted on Supabase Storage, includes 5-minute cache
- `src/types/videos.ts` - TypeScript interfaces for video data
- `src/lib/kannada.ts` - Kannada language utilities (consonants, vowels, matras, akshara segmentation, letter timings for audio sync)

### Key Patterns
- Videos are fetched from a remote CSV file, not a database
- Video playback uses `expo-video` with HLS streaming
- The typewriter syncs letter highlighting with an audio file using precise millisecond timings
- Path alias `@/*` maps to project root

### Styling
- Uses React Native StyleSheet (not NativeWind/Tailwind classes despite dependency)
- Dark theme with purple accent (#8B5CF6, #4F46E5)
- Background colors: #111827 (screen), #1F2937 (cards)

## Kannada Language Notes

The app uses Unicode Kannada characters. Key concepts:
- **Swaras** (vowels): ಅ, ಆ, ಇ, etc.
- **Vyanjanas** (consonants): ಕ, ಖ, ಗ, etc. (organized in 5-letter vargas/families)
- **Matras**: Vowel signs that attach to consonants
- **Virama** (್): Halant mark that removes inherent vowel
- **Akshara**: A syllable unit (consonant + optional virama + consonants + vowel/matra)
