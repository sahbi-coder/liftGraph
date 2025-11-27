import React from 'react';
import { ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { YStack, XStack, Text } from 'tamagui';
import { BarChart3, TrendingUp, Activity } from '@tamagui/lucide-icons';

import { colors } from '@/theme/colors';

type ProgressMetric = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
};

const progressMetrics: ProgressMetric[] = [
  {
    id: 'estimated-1rm',
    title: 'Estimated 1RM Trend',
    description:
      'Track your training max (e1RM) per lift (Squat, Bench, Deadlift, OHP). Shows rate of improvement, strength plateau detection, and big jumps from blocks or cycles.',
    icon: TrendingUp,
    color: colors.niceOrange,
  },
  {
    id: 'top-set',
    title: 'Top Set Progression Chart',
    description:
      'Track top weight × reps over time as a bubble chart. X-axis = date, Y-axis = weight, bubble size = reps. See progression like 405×1 → 405×3 → 420×1 → 425×1.',
    icon: Activity,
    color: '#3b82f6',
  },
  {
    id: 'weekly-volume',
    title: 'Weekly Volume Load (Per Lift Group)',
    description:
      'Chart weekly volume (weight × reps × sets) for Squat family, Bench family, Deadlift family, Accessory volume, and Total volume. Essential for detecting under-training, overtraining, block transitions, deloads, and recovery issues.',
    icon: BarChart3,
    color: '#10b981',
  },
  {
    id: 'frequency-chart',
    title: 'Workout Frequency',
    description:
      'Bar showing how often you hit Squat, Bench, Deadlift, OHP, Accessory pulls, Core, and Upper back. Reveals training balance and helps coaches spot imbalances.',
    icon: BarChart3,
    color: '#8b5cf6',
  },
];

export default function ProgressScreen() {
  const router = useRouter();

  const handleMetricPress = (metricId: string) => {
    router.push(`/(tabs)/progress/${metricId}` as any);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.darkerGray }}
      contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
    >
      <YStack space="$4">
        <YStack space="$2">
          <Text color="$textSecondary" fontSize="$5">
            Explore your training data and insights
          </Text>
        </YStack>

        <YStack space="$3">
          {progressMetrics.map((metric) => {
            const IconComponent = metric.icon;
            return (
              <Pressable
                key={metric.id}
                onPress={() => handleMetricPress(metric.id)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <YStack
                  padding="$3"
                  backgroundColor={colors.midGray}
                  borderRadius="$4"
                  borderWidth={1}
                  borderColor={colors.darkGray}
                  space="$2"
                >
                  <XStack alignItems="center" space="$3">
                    <YStack
                      width={48}
                      height={48}
                      borderRadius="$3"
                      backgroundColor={`${metric.color}20`}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <IconComponent size={24} color={metric.color} />
                    </YStack>
                    <YStack flex={1} space="$1">
                      <Text color="$textPrimary" fontSize="$5" fontWeight="600">
                        {metric.title}
                      </Text>
                      <Text color="$textSecondary" fontSize="$3" numberOfLines={3}>
                        {metric.description}
                      </Text>
                    </YStack>
                  </XStack>
                </YStack>
              </Pressable>
            );
          })}
        </YStack>
      </YStack>
    </ScrollView>
  );
}
