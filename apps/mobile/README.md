# LiftGraph Mobile

The React Native mobile app for LiftGraph powerlifting tracker.

## Getting Started

### Prerequisites

- Node.js 22 (use nvm to install the correct version)
- Yarn 1.x
- iOS: Xcode and CocoaPods
- Android: Android Studio and JDK

### Installation

```bash
# From the root of the monorepo
yarn

# Or from this directory
cd apps/mobile
yarn
```

### Running the App

```bash
# From the root of the monorepo
yarn mobile:start

# Then press 'i' for iOS or 'a' for Android
```

## Project Structure

- `src/app/` - App routes using Expo Router
- `src/theme/` - Theming and fonts
- `assets/` - Images, fonts, and other static assets

## Tech Stack

- React Native
- Expo
- Expo Router (file-based routing)
- Tamagui (UI components and styling)
- TypeScript
