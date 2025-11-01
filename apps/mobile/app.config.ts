import { ExpoConfig } from '@expo/config';

import { version } from './package.json';

const config: ExpoConfig = {
  name: 'LiftGraph',
  slug: 'liftgraph',
  version,
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'liftgraph',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    requireFullScreen: true,
    bundleIdentifier: 'com.liftgraph.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.liftgraph.app',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: ['expo-router', 'expo-font'],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
  },
};

export default config;
