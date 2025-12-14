import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { YStack, Text, Button } from 'tamagui';

import { colors } from '@/theme/colors';
import { WorkoutHomeScreen } from '@/components/workout/WorkoutHomeScreen';
import { useLatestValidatedWorkout } from '@/hooks/useLatestValidatedWorkout';
import { useEarliestFutureWorkout } from '@/hooks/useEarliestFutureWorkout';
import { useAlertModal } from '@/hooks/useAlertModal';
import { useTranslation } from '@/hooks/useTranslation';

export default function WorkoutHome() {
  const router = useRouter();
  const { t } = useTranslation();
  const { showInfo, AlertModalComponent } = useAlertModal();

  const {
    workout: latestWorkout,
    isLoading: isLoadingLatest,
    isError: isErrorLatest,

    refetch: refetchLatest,
  } = useLatestValidatedWorkout();

  const {
    workout: earliestFutureWorkout,
    isLoading: isLoadingFuture,
    isError: isErrorFuture,

    refetch: refetchFuture,
  } = useEarliestFutureWorkout();

  const handleCreateWorkout = useCallback(() => {
    router.push('/(drawer)/(tabs)/workout/create');
  }, [router]);

  const handleEditWorkout = useCallback(() => {
    if (!latestWorkout) {
      showInfo(t('workout.createWorkoutBeforeEdit'));
      return;
    }

    router.push({
      pathname: '/(drawer)/(tabs)/workout/edit',
      params: { workoutId: latestWorkout.id },
    });
  }, [latestWorkout, router, showInfo]);

  const handleEditFutureWorkout = useCallback(() => {
    if (!earliestFutureWorkout) {
      showInfo(t('workout.noUpcomingWorkoutsToEdit'));
      return;
    }

    router.push({
      pathname: '/(drawer)/(tabs)/workout/edit',
      params: { workoutId: earliestFutureWorkout.id },
    });
  }, [earliestFutureWorkout, router, showInfo]);

  // Show loading state
  if (isLoadingLatest || isLoadingFuture) {
    return (
      <YStack
        flex={1}
        backgroundColor={colors.darkerGray}
        justifyContent="center"
        alignItems="center"
        padding="$4"
      >
        <Text color="$textPrimary" fontSize="$5">
          {t('workout.loadingWorkouts')}
        </Text>
      </YStack>
    );
  }

  // Show error state
  if (isErrorLatest || isErrorFuture) {
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
          {t('workout.failedToLoadWorkouts')}
        </Text>
        <Button
          backgroundColor="$primaryButton"
          color={colors.white}
          onPress={() => {
            if (isErrorLatest) refetchLatest();
            if (isErrorFuture) refetchFuture();
          }}
        >
          {t('common.retry')}
        </Button>
      </YStack>
    );
  }

  return (
    <>
      <WorkoutHomeScreen
        latestWorkout={latestWorkout}
        earliestFutureWorkout={earliestFutureWorkout}
        onCreateWorkout={handleCreateWorkout}
        onEditWorkout={handleEditWorkout}
        onEditFutureWorkout={handleEditFutureWorkout}
      />
      <AlertModalComponent />
    </>
  );
}
