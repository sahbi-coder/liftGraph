import React from 'react';
import { ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { YStack, XStack, Text } from 'tamagui';
import { BarChart3, TrendingUp, Activity } from '@tamagui/lucide-icons';

import { colors } from '@/theme/colors';
import { useTranslation } from '@/hooks/common/useTranslation';

type ProgressMetric = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
};

const getProgressMetrics = (t: any): ProgressMetric[] => [
  {
    id: 'estimated-1rm',
    title: t('progress.estimated1RMTrend'),
    description: t('progress.estimated1RMTrendDescription'),
    icon: TrendingUp,
    color: colors.niceOrange,
  },
  {
    id: 'top-set',
    title: t('progress.topSetProgressionChart'),
    description: t('progress.topSetProgressionDescription'),
    icon: Activity,
    color: '#3b82f6',
  },
  {
    id: 'weekly-volume',
    title: t('progress.weeklyVolumeLoad'),
    description: t('progress.weeklyVolumeDescription'),
    icon: BarChart3,
    color: '#10b981',
  },
  {
    id: 'frequency-chart',
    title: t('progress.workoutFrequency'),
    description: t('progress.frequencyChartDescription'),
    icon: BarChart3,
    color: '#8b5cf6',
  },
];

export default function ProgressScreen() {
  const router = useRouter();
  const { t } = useTranslation();

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
            {t('progress.exploreYourTrainingData')}
          </Text>
        </YStack>

        <YStack space="$3">
          {getProgressMetrics(t).map((metric) => {
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
