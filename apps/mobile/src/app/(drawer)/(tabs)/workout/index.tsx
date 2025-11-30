import React, { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { YStack, Text, Button } from 'tamagui';

import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/theme/colors';
import { WorkoutHomeScreen } from '@/components/workout/WorkoutHomeScreen';
import { useLatestValidatedWorkout } from '@/hooks/useLatestValidatedWorkout';
import { useEarliestFutureWorkout } from '@/hooks/useEarliestFutureWorkout';
import { AlertModal } from '@/components/AlertModal';

export default function WorkoutHome() {
  const router = useRouter();
  const { user } = useAuth();
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'info',
  });

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
      setAlertModal({
        visible: true,
        message: 'Please sign in to edit workouts.',
        type: 'warning',
      });
      return;
    }

    if (!latestWorkout) {
      setAlertModal({
        visible: true,
        message: 'Create a workout before trying to edit.',
        type: 'info',
      });
      return;
    }

    router.push({
      pathname: '/(drawer)/(tabs)/workout/edit',
      params: { workoutId: latestWorkout.id },
    });
  }, [latestWorkout, router, user]);

  const handleEditFutureWorkout = useCallback(() => {
    if (!user) {
      setAlertModal({
        visible: true,
        message: 'Please sign in to edit workouts.',
        type: 'warning',
      });
      return;
    }

    if (!earliestFutureWorkout) {
      setAlertModal({
        visible: true,
        message: 'No upcoming workouts to edit.',
        type: 'info',
      });
      return;
    }

    router.push({
      pathname: '/(drawer)/(tabs)/workout/edit',
      params: { workoutId: earliestFutureWorkout.id },
    });
  }, [earliestFutureWorkout, router, user]);

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
      <AlertModal
        visible={alertModal.visible}
        message={alertModal.message}
        type={alertModal.type}
        duration={4000}
        onComplete={() => setAlertModal((prev) => ({ ...prev, visible: false }))}
      />
    </>
  );
}
