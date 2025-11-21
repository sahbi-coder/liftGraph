import React from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { BarChart3 } from '@tamagui/lucide-icons';

import { colors } from '@/theme/colors';

export default function FrequencyChartScreen() {
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
              backgroundColor="#8b5cf620"
              alignItems="center"
              justifyContent="center"
            >
              <BarChart3 size={32} color="#8b5cf6" />
            </YStack>
            <YStack flex={1} space="$1">
              <Text color="$textPrimary" fontSize="$7" fontWeight="700">
                Workout Frequency
              </Text>
            </YStack>
          </XStack>
          <Text color="$textSecondary" fontSize="$4">
            Bar or heatmap showing how often you hit Squat, Bench, Deadlift, OHP, Accessory pulls,
            Core, and Upper back. Reveals training balance and helps coaches spot imbalances.
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
