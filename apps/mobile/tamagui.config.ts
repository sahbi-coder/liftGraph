import { config } from '@tamagui/config/v3';
import { createInterFont } from '@tamagui/font-inter';
import { createTamagui } from 'tamagui';

const interFont = createInterFont();

export const tamaguiConfig = createTamagui({
  ...config,
  fonts: {
    heading: interFont,
    body: interFont,
  },
  themes: {
    light: {
      background: '#FFFFFF',
      primaryButton: '#FF5722',
      primaryButtonText: '#FFFFFF',
      primaryButtonDisabled: '#F4F4F4',
      primaryButtonDisabledText: '#C6C6C6',
      inputFieldBorder: '#C6C6C6',
      inputFieldPlaceholderText: '#706F74',
      inputFieldText: '#484848',
      errorColor: '#FF5A56',
      accentColor: '#FF5722',
      textPrimary: '#000000',
      textSecondary: '#706F74',
    },
    dark: {
      background: '#121212',
      primaryButton: '#FF5722',
      primaryButtonText: '#FFFFFF',
      primaryButtonDisabled: '#2C2C2C',
      primaryButtonDisabledText: '#666666',
      inputFieldBorder: '#444444',
      inputFieldPlaceholderText: '#888888',
      inputFieldText: '#FFFFFF',
      errorColor: '#FF5A56',
      accentColor: '#FF5722',
      textPrimary: '#FFFFFF',
      textSecondary: '#888888',
    },
  },
});

export default tamaguiConfig;

export type Conf = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}
