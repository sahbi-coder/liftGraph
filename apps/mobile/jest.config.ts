import { Config } from 'jest';
import path from 'path';

const config: Config = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/testSetup.tsx'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|tamagui|@tamagui/.*)',
  ],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/jest.setup.js',
  ],
  moduleNameMapper: {
    '^@/(.*)$': path.join(__dirname, 'src', '$1'),
    '^tamagui\\.config$': path.join(__dirname, 'tamagui.config'),
  },
};

export default config;
