import { config } from '@tamagui/config/v3';
import { createInterFont } from '@tamagui/font-inter';
import { createTamagui } from 'tamagui';

import { colors } from './src/theme/colors';

const interFont = createInterFont();

export const tamaguiConfig = createTamagui({
  ...config,
  fonts: {
    heading: interFont,
    body: interFont,
  },
  themes: {
    light: {
      background: colors.darkerGray,
      secondarybackground: colors.darkGray,
      primaryButton: colors.niceOrange,
      primaryButtonText: colors.white,
      primaryButtonDisabled: '#F4F4F4',
      primaryButtonDisabledText: '#C6C6C6',
      secondaryButton: colors.midGray,
      secondaryButtonText: colors.white,
      secondaryButtonDisabled: '#2C2C2C',
      secondaryButtonDisabledText: '#666666',
      inputFieldBorder: colors.midGray,
      inputFieldBackground: colors.midGray,
      inputFieldPlaceholderText: colors.lightGray,
      inputFieldText: colors.white,
      inputFieldFocusBorder: colors.niceOrange,
      errorColor: '#FF5A56',
      accentColor: '#FF5722',
      textPrimary: colors.white,
      textSecondary: '#706F74',
      textTertiary: colors.niceOrange,
    },
    dark: {
      background: colors.darkerGray,
      secondarybackground: colors.darkGray,
      primaryButton: colors.niceOrange,
      primaryButtonText: colors.white,
      primaryButtonDisabled: '#2C2C2C',
      primaryButtonDisabledText: '#666666',
      secondaryButton: colors.midGray,
      secondaryButtonText: colors.white,
      secondaryButtonDisabled: '#2C2C2C',
      secondaryButtonDisabledText: '#666666',
      inputFieldBorder: colors.midGray,
      inputFieldBackground: colors.midGray,
      inputFieldPlaceholderText: colors.lightGray,
      inputFieldText: colors.white,
      inputFieldFocusBorder: colors.niceOrange,
      errorColor: '#FF5A56',
      accentColor: '#FF5722',
      textPrimary: colors.white,
      textSecondary: '#888888',
      textTertiary: colors.niceOrange,
    },
  },
});

export default tamaguiConfig;

export type Conf = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}
