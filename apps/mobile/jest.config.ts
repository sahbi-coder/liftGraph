import { Config } from 'jest';
import path from 'path';

const config: Config = {
  preset: 'jest-expo',
  // testSetup.tsx is imported directly by tests that need it, not via setupFilesAfterEnv
  // This prevents the mocks from affecting tests outside of __tests__ directory
  testPathIgnorePatterns: [
    '/node_modules/',
    '/src/__tests__/testSetup.tsx', // Exclude testSetup from being run as a test
  ],
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
