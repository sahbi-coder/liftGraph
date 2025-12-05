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
    googleServicesFile: './GoogleService-Info.plist',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.kardiServiceInformatique.liftGraph',
    googleServicesFile: './google-services.json',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: ['expo-router', 'expo-font', 'expo-file-system'],
  // Temporarily disable typedRoutes experiment to fix route discovery
  // experiments: {
  //   typedRoutes: true,
  // },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: '73b63277-b469-45a4-966d-8d5a6736c54e',
    },
  },
};

export default config;
