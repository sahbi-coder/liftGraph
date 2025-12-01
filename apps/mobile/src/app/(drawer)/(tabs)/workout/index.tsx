import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { YStack, Text, Button } from 'tamagui';

import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/theme/colors';
import { WorkoutHomeScreen } from '@/components/workout/WorkoutHomeScreen';
import { useLatestValidatedWorkout } from '@/hooks/useLatestValidatedWorkout';
import { useEarliestFutureWorkout } from '@/hooks/useEarliestFutureWorkout';
import { useAlertModal } from '@/hooks/useAlertModal';

export default function WorkoutHome() {
  const router = useRouter();
  const { user } = useAuth();
  const { showWarning, showInfo, AlertModalComponent } = useAlertModal();

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
    if (!user) {
      showWarning('Please sign in to edit workouts.');
      return;
    }

    if (!latestWorkout) {
      showInfo('Create a workout before trying to edit.');
      return;
    }

    router.push({
      pathname: '/(drawer)/(tabs)/workout/edit',
      params: { workoutId: latestWorkout.id },
    });
  }, [latestWorkout, router, user, showWarning, showInfo]);

  const handleEditFutureWorkout = useCallback(() => {
    if (!user) {
      showWarning('Please sign in to edit workouts.');
      return;
    }

    if (!earliestFutureWorkout) {
      showInfo('No upcoming workouts to edit.');
      return;
    }

    router.push({
      pathname: '/(drawer)/(tabs)/workout/edit',
      params: { workoutId: earliestFutureWorkout.id },
    });
  }, [earliestFutureWorkout, router, user, showWarning, showInfo]);

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
          Loading workouts...
        </Text>
      </YStack>
    );
  }

  // Show error state
  if (isErrorLatest || isErrorFuture) {
    const errorMessage = 'Failed to load workouts';

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
          {errorMessage}
        </Text>
        <Button
          backgroundColor="$primaryButton"
          color={colors.white}
          onPress={() => {
            if (isErrorLatest) refetchLatest();
            if (isErrorFuture) refetchFuture();
          }}
        >
          Retry
        </Button>
      </YStack>
    );
  }

  return (
    <>
      <WorkoutHomeScreen
        latestWorkout={latestWorkout ?? null}
        earliestFutureWorkout={earliestFutureWorkout ?? null}
        isLoadingLatest={isLoadingLatest}
        isLoadingFuture={isLoadingFuture}
        onCreateWorkout={handleCreateWorkout}
        onEditWorkout={handleEditWorkout}
        onEditFutureWorkout={handleEditFutureWorkout}
      />
      <AlertModalComponent />
    </>
  );
}
