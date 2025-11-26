import React from 'react';
import { Text } from 'react-native';
import { YStack } from 'tamagui';
import Feather from '@expo/vector-icons/Feather';

import { colors } from '@/theme/colors';

export function NoInternetScreen() {
  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor={colors.darkerGray}
      padding="$4"
      gap="$4"
    >
      <Feather name="wifi-off" size={64} color={colors.niceOrange} />
      <YStack alignItems="center" gap="$2">
        <Text style={{ color: colors.white, fontSize: 24, fontWeight: 'bold' }}>
          No Internet Connection
        </Text>
        <Text
          style={{
            color: colors.midGray,
            fontSize: 16,
            textAlign: 'center',
            maxWidth: 300,
          }}
        >
          Please check your internet connection and try again.
        </Text>
      </YStack>
    </YStack>
  );
}
