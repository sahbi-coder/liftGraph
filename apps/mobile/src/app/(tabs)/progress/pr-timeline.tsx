import React from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { Calendar } from '@tamagui/lucide-icons';

import { colors } from '@/theme/colors';

export default function PRTimelineScreen() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.darkerGray }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
    >
      <YStack space="$4">
        <YStack padding="$4" backgroundColor={colors.midGray} borderRadius="$4" space="$3">
          <XStack alignItems="center" space="$3">
            <YStack
              width={64}
              height={64}
              borderRadius="$3"
              backgroundColor="#f59e0b20"
              alignItems="center"
              justifyContent="center"
            >
              <Calendar size={32} color="#f59e0b" />
            </YStack>
            <YStack flex={1} space="$1">
              <Text color="$textPrimary" fontSize="$7" fontWeight="700">
                PR Timeline Chart
              </Text>
            </YStack>
          </XStack>
          <Text color="$textSecondary" fontSize="$4">
            Plot ALL PR categories: 1RM PR, 3RM PR, 5RM PR, Volume PR, Rep PR, and Top-set PR. Each
            PR type has its own marker. Very motivating to see all your achievements over time.
          </Text>
        </YStack>

        <YStack padding="$4" backgroundColor={colors.midGray} borderRadius="$4" space="$3">
          <Text color="$textPrimary" fontSize="$5" fontWeight="600">
            Chart Coming Soon
          </Text>
          <Text color="$textSecondary" fontSize="$4">
            This chart will be implemented soon. Check back later for detailed analytics and
            visualizations.
          </Text>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
