# LiftGraph Project Setup

This document describes the structure and setup of the LiftGraph powerlifting tracking app.

## Project Overview

LiftGraph is a React Native app built with Expo for tracking powerlifting progress. It follows the same architectural patterns as the Junior project with a monorepo structure using Yarn workspaces.

## Tech Stack

- **React Native** with Expo SDK 53
- **Expo Router** for file-based routing
- **Tamagui** for UI components and theming
- **TypeScript** for type safety
- **Yarn Workspaces** for monorepo management
- **Jest** for testing

## Project Structure

```
liftGraph/
├── apps/
│   └── mobile/              # React Native mobile app
│       ├── src/
│       │   ├── app/         # Expo Router routes
│       │   │   ├── _layout.tsx
│       │   │   └── index.tsx
│       │   └── theme/       # Theming configuration
│       ├── assets/          # Images and fonts
│       ├── app.config.ts    # Expo configuration
│       ├── tamagui.config.ts
│       ├── babel.config.js
│       ├── metro.config.js
│       └── package.json
├── packages/
│   └── common/              # Shared code and types
│       ├── src/
│       │   ├── types.ts
│       │   └── index.ts
│       └── package.json
├── tsconfig/                # Shared TypeScript configs
│   ├── base.json
│   └── expo.base.json
├── package.json             # Root package with workspaces
├── tsconfig.json
└── README.md
```

## Current Features

### Home Screen (index.tsx)
- Simple welcome screen with LiftGraph branding
- "Get Started" button (functionality to be implemented)
- Uses Tamagui theming system
- Responsive layout

### Theming
- Custom Tamagui configuration with powerlifting-themed colors
- Primary accent color: Orange/Red (#FF5722)
- Support for light and dark themes
- Custom font setup using Inter font family

## Getting Started

### Prerequisites
- Node.js 22 (use nvm: `nvm install`)
- Yarn 1.x (classic)
- For iOS: Xcode and CocoaPods
- For Android: Android Studio and JDK

### Installation

```bash
# Install dependencies
cd liftGraph
yarn

# Start the development server
yarn mobile:start
```

### Running on Devices

After starting the dev server:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical devices

## Next Steps

### Immediate Tasks
1. **Add Assets**: Create icon.png, splash.png, adaptive-icon.png, and favicon.png in `apps/mobile/assets/`
2. **Environment Variables**: Set up .env files if external services are needed

### Future Development
1. **Authentication**: User registration and login
2. **Workout Tracking**: Log exercises, sets, reps, and weights
3. **Progress Visualization**: Charts and graphs for tracking progress
4. **Exercise Library**: Database of powerlifting exercises
5. **Personal Records**: Track and display PRs
6. **Workout Programs**: Pre-built training programs
7. **Data Persistence**: Local storage with AsyncStorage or SQLite
8. **Backend Integration**: Optional cloud sync with Firebase or custom backend

## Design Patterns from Junior

This project follows these patterns from the Junior app:

1. **Monorepo Structure**: Yarn workspaces for apps and packages
2. **Expo Router**: File-based routing system
3. **Tamagui**: UI component library and theming
4. **TypeScript**: Strict typing throughout
5. **Component Organization**: Separation of concerns with src/ directory structure
6. **Theme Provider**: Centralized theming with custom configuration
7. **Font Loading**: Custom font management with expo-font

## Scripts

### Root Level
- `yarn mobile:start` - Start the mobile app dev server
- `yarn build` - Build all workspaces
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier
- `yarn test` - Run all tests

### Mobile App
- `yarn workspace @liftgraph/mobile start` - Start development server
- `yarn workspace @liftgraph/mobile android` - Run on Android
- `yarn workspace @liftgraph/mobile ios` - Run on iOS
- `yarn workspace @liftgraph/mobile build` - Build TypeScript

## Configuration Files

- **package.json**: Dependencies and scripts for each workspace
- **tsconfig.json**: TypeScript configuration
- **babel.config.js**: Babel configuration for React Native
- **metro.config.js**: Metro bundler configuration for monorepo
- **tamagui.config.ts**: Tamagui theming and design tokens
- **app.config.ts**: Expo app configuration
- **eas.json**: EAS Build and Submit configuration

## Notes

- The project uses React 19.0.0 and React Native 0.79.5
- New architecture is enabled in Expo config
- Yarn resolutions ensure consistent package versions across workspaces
- Metro is configured to work with the monorepo structure

## Support

For issues or questions, refer to:
- [Expo Documentation](https://docs.expo.dev/)
- [Tamagui Documentation](https://tamagui.dev/)
- [React Native Documentation](https://reactnative.dev/)

