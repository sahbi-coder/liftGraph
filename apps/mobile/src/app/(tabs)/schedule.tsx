import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { YStack, Text, Button } from 'tamagui';

import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/theme/colors';
import { ScheduleScreen } from '@/components/schedule/ScheduleScreen';
import { useUserWorkouts } from '@/hooks/useUserWorkouts';

export default function Schedule() {
  const router = useRouter();
  const { user } = useAuth();

  const { workouts, isLoading, isError, refetch } = useUserWorkouts();

  const handleDayPress = useCallback(
    (workoutId: string) => {
      router.push({
        pathname: '/(tabs)/workout/edit',
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
          Loading schedule...
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
          Failed to load schedule
        </Text>
        <Button backgroundColor="$primaryButton" color={colors.white} onPress={() => refetch()}>
          Retry
        </Button>
      </YStack>
    );
  }

  if (!user) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={colors.darkerGray}
        padding="$4"
      >
        <Text color={colors.white} fontSize="$5" textAlign="center">
          Please sign in to view your schedule.
        </Text>
      </YStack>
    );
  }

  return <ScheduleScreen workouts={workouts ?? []} onDayPress={handleDayPress} />;
}
