import React from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { GitCompare } from '@tamagui/lucide-icons';

import { colors } from '@/theme/colors';

export default function VariationComparisonScreen() {
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
              backgroundColor="#ec489920"
              alignItems="center"
              justifyContent="center"
            >
              <GitCompare size={32} color="#ec4899" />
            </YStack>
            <YStack flex={1} space="$1">
              <Text color="$textPrimary" fontSize="$7" fontWeight="700">
                Movement Variation Comparison
              </Text>
            </YStack>
          </XStack>
          <Text color="$textSecondary" fontSize="$4">
            Compare squat variations (high-bar, low-bar, SSB, front, tempo) and other movements.
            Chart average intensity, top sets, and progression of each. See which variations produce
            the best carryover.
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
