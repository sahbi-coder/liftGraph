# LiftGraph Quick Start Guide

Get up and running with LiftGraph in minutes!

## Prerequisites

Make sure you have the following installed:
- **Node.js 22** (use nvm to install: `nvm install 22`)
- **Yarn 1.x** (install with: `npm install -g yarn`)
- **Expo CLI** (will be installed with dependencies)

For iOS development:
- macOS with Xcode installed
- CocoaPods (`sudo gem install cocoapods`)

For Android development:
- Android Studio
- JDK 17 or higher

## Installation

```bash
# 1. Navigate to the project directory
cd liftGraph

# 2. Install dependencies
yarn

# 3. Navigate to mobile app (optional, for specific mobile commands)
cd apps/mobile
```

## Running the App

### Option 1: Quick Start (Recommended for Testing)

```bash
# From the root directory
yarn mobile:start
```

This will start the Expo development server. You'll see a QR code in your terminal.

**On Your Phone:**
1. Install **Expo Go** app from App Store (iOS) or Play Store (Android)
2. Scan the QR code with your camera (iOS) or Expo Go app (Android)
3. The app will load on your device!

### Option 2: Using Simulators/Emulators

After running `yarn mobile:start`:

**iOS Simulator:**
- Press `i` in the terminal
- Xcode and iOS Simulator must be installed

**Android Emulator:**
- Press `a` in the terminal
- Android Studio and an emulator must be set up

## Important: Assets Required

Before the app will fully work, you need to add image assets. See `apps/mobile/assets/README.md` for details.

**Quick Fix for Testing:**
You can create simple placeholder images or the app might show warnings. For now, you can proceed without them to see the home screen structure.

## Project Structure Overview

```
liftGraph/
├── apps/mobile/          # The React Native app
│   └── src/app/         # Your app screens (Expo Router)
│       ├── _layout.tsx  # Root layout
│       └── index.tsx    # Home screen ✨
└── packages/common/     # Shared code
```

## What You'll See

When you first run the app, you'll see:
- **LiftGraph** title
- "Track your powerlifting progress" subtitle
- A "Get Started" button (not yet functional)
- Clean, modern UI with orange accent color

## Next Steps

1. **Explore the Code:**
   - Check out `apps/mobile/src/app/index.tsx` for the home screen
   - Look at `apps/mobile/tamagui.config.ts` for theming

2. **Add Features:**
   - Create new screens in `apps/mobile/src/app/`
   - Add components in `apps/mobile/src/components/`
   - Define shared types in `packages/common/src/`

3. **Customize:**
   - Update colors in `tamagui.config.ts`
   - Add your own assets
   - Modify the home screen message

## Common Commands

```bash
# Start development server
yarn mobile:start

# Run on iOS
yarn mobile:start
# Then press 'i'

# Run on Android
yarn mobile:start
# Then press 'a'

# Build TypeScript
yarn build

# Run linting
yarn lint

# Format code
yarn format

# Run tests
yarn test
```

## Troubleshooting

### "Cannot find module" errors
```bash
# Clear all caches and reinstall
yarn
cd apps/mobile
rm -rf node_modules
cd ../..
rm -rf node_modules
yarn
```

### Metro bundler issues
```bash
# Start with cache cleared
yarn mobile:start --clear
```

### iOS build issues
```bash
cd apps/mobile/ios
pod install
cd ../../..
```

## Development Tips

1. **Hot Reload**: Save any file and see changes instantly!
2. **Debug Menu**: Shake your device or press `Cmd+D` (iOS) / `Cmd+M` (Android) in simulators
3. **Console Logs**: Use `console.log()` - they'll appear in your terminal
4. **React DevTools**: Press `j` in the terminal after starting the dev server

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Tamagui](https://tamagui.dev/)
- [React Native](https://reactnative.dev/)

## Need Help?

Check out:
- `README.md` - Project overview
- `PROJECT_SETUP.md` - Detailed setup information
- `apps/mobile/README.md` - Mobile app specific docs

Happy coding! 🏋️

