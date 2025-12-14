import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { YStack, Text, Button } from 'tamagui';

import { colors } from '@/theme/colors';
import { ScheduleScreen } from '@/components/schedule/ScheduleScreen';
import { useUserWorkouts } from '@/hooks/useUserWorkouts';
import { useTranslation } from '@/hooks/useTranslation';

export default function Schedule() {
  const router = useRouter();
  const { t } = useTranslation();

  const { workouts, isLoading, isError, refetch } = useUserWorkouts();

  const handleDayPress = useCallback(
    (workoutId: string) => {
      router.push({
        pathname: '/(tabs)/schedule/edit',
        params: { workoutId },
      });
    },
    [router],
  );

  // Show loading state
  if (isLoading) {
    return (
      <YStack
        flex={1}
        backgroundColor={colors.darkerGray}
        justifyContent="center"
        alignItems="center"
        padding="$4"
      >
        <Text color="$textPrimary" fontSize="$5">
          {t('schedule.loadingSchedule')}
        </Text>
      </YStack>
    );
  }

  // Show error state
  if (isError) {
    return (
      <YStack
        flex={1}
        backgroundColor={colors.darkerGray}
        justifyContent="center"
        alignItems="center"
        padding="$4"
        space="$4"
      >
        <Text color="$textPrimary" fontSize="$5" textAlign="center">
          {t('schedule.failedToLoadSchedule')}
        </Text>
        <Button backgroundColor="$primaryButton" color={colors.white} onPress={() => refetch()}>
          {t('common.retry')}
        </Button>
      </YStack>
    );
  }

  return <ScheduleScreen workouts={workouts ?? []} onDayPress={handleDayPress} />;
}
