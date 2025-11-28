# LiftGraph - Powerlifting Progress Tracker

A React Native app for tracking powerlifting progress, built with Expo, Firebase, and Tamagui.

## Features

- 🔐 **Authentication** - Email/password login and signup
- 🏋️ **Workout Tracking** - Log exercises, sets, reps, weight, and RIR (Reps in Reserve)
- 📊 **Progress Analytics** - Visualize your strength gains with multiple chart types:
  - Estimated 1RM trends
  - Top set progression charts
  - Weekly volume tracking
  - Workout frequency analysis
- 📅 **Program Management** - Create and manage training programs (simple, alternating, and advanced multi-phase)
- 📱 **Cross-platform** - iOS and Android support
- 🔥 **Firebase Backend** - Real-time database and authentication
- 🎨 **Modern UI** - Built with Tamagui design system

## Getting Started

### Project Structure

- `apps/mobile` - React Native app with authentication
- `apps/backend` - Firebase Functions and Firestore configuration
- `packages/common` - Shared code between apps

### Prerequisites

- nvm
- yarn classic (v1)

### Installation

```bash
# install the correct node version
nvm install

# install the dependencies
yarn

# set up Firebase (see FIREBASE_SETUP.md for detailed instructions)
firebase login

# create .env file for mobile app
cp apps/mobile/env.example apps/mobile/.env
# Edit .env and add your Firebase configuration
```

### Development

#### Quick Start

**Terminal 1 - Start Firebase Emulators:**

```bash
yarn backend:emulators:start
```

**Terminal 2 - Start Mobile App:**

```bash
yarn mobile:start
```

Then press `i` for iOS or `a` for Android.

#### Detailed Setup

See [`FIREBASE_SETUP.md`](FIREBASE_SETUP.md) for complete Firebase setup instructions.

### Installing dependencies

Always install dependencies in the workspace that is using them.

```bash
# install an expo version dependent package
yarn workspace @liftgraph/mobile expo add <package-name>

# install a package in the mobile app using yarn
yarn workspace @liftgraph/mobile add <package-name>
```

### Testing

```bash
# build using tsc
yarn build

# linting
yarn lint

# testing with jest
yarn test
```
