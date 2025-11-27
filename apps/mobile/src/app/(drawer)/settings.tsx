import React from 'react';
import { YStack, Text } from 'tamagui';
import { colors } from '@/theme/colors';

export default function SettingsScreen() {
  return (
    <YStack flex={1} backgroundColor={colors.darkerGray} padding="$4" paddingTop="$10">
      <Text color={colors.white} fontSize="$9" fontWeight="bold">
        Settings
      </Text>
      <Text color={colors.midGray} fontSize="$5" marginTop="$4">
        Settings screen content goes here
      </Text>
    </YStack>
  );
}
