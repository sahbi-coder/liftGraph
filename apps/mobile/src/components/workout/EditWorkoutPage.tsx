import React, { useCallback, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter, useSegments } from 'expo-router';
import { YStack, Text, Button } from 'tamagui';
import { ActivityIndicator } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/theme/colors';
import { EditWorkoutScreen } from '@/components/workout/EditWorkoutScreen';
import { useWorkout } from '@/hooks/useWorkout';
import { useWorkoutMutations } from '@/hooks/useWorkoutMutations';
import { useAlertModal } from '@/hooks/useAlertModal';
import { ConfirmationModal } from '@/components/ConfirmationModal';

export function EditWorkoutPage() {
  const router = useRouter();
  const segments = useSegments();
  const { workoutId: workoutIdParam } = useLocalSearchParams<{ workoutId?: string | string[] }>();
  const workoutId = useMemo(() => {
    if (Array.isArray(workoutIdParam)) {
      return workoutIdParam[0];
    }
    return workoutIdParam;
  }, [workoutIdParam]);

  // Detect if we're in schedule or workout context based on route segments
  const exerciseNavigationPath = useMemo(() => {
    const pathString = segments.join('/');
    if (pathString.includes('schedule')) {
      return '/(drawer)/(tabs)/schedule/exercises';
    }
    return '/(drawer)/(tabs)/workout/exercises';
  }, [segments]);

  const { user } = useAuth();
  const { workout, isLoading, isError, refetch } = useWorkout(workoutId);
  const {
    updateWorkout,
    isUpdating,
    validateWorkout,
    isValidating,
    unvalidateWorkout,
    isUnvalidating,
    deleteWorkout,
    isDeleting,
  } = useWorkoutMutations(workoutId);

  const { showSuccess, showError, AlertModalComponent } = useAlertModal();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeletingWorkout, setIsDeletingWorkout] = useState(false);

  const handleUpdateWorkout = useCallback(
    async (workoutPayload: Parameters<typeof updateWorkout>[0]) => {
      if (!user || !workoutId) {
        showError('Please sign in to edit workouts.');
        return;
      }

      try {
        await updateWorkout(workoutPayload);
        showSuccess('Your workout has been updated successfully.');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Something went wrong.';
        showError(message);
      }
    },
    [user, workoutId, updateWorkout, showSuccess, showError],
  );

  const handleValidateWorkout = useCallback(async () => {
    if (!user || !workoutId) {
      showError('Please sign in to validate workouts.');
      return;
    }

    try {
      await validateWorkout();
      showSuccess('Your workout has been marked as complete.');
      // Navigate back after showing success message
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      showError(message);
    }
  }, [router, user, workoutId, validateWorkout, showSuccess, showError]);

  const handleUnvalidateWorkout = useCallback(async () => {
    if (!user || !workoutId) {
      showError('Please sign in to unvalidate workouts.');
      return;
    }

    try {
      await unvalidateWorkout();
      showSuccess('You can now edit this workout.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      showError(message);
    }
  }, [user, workoutId, unvalidateWorkout, showSuccess, showError]);

  const handleDeleteWorkout = useCallback(() => {
    setIsDeleteModalVisible(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    setIsDeleteModalVisible(false);
    if (!user || !workoutId) {
      showError('Please sign in to delete workouts.');
      return;
    }

    try {
      setIsDeletingWorkout(true);
      await deleteWorkout();
      showSuccess('Workout deleted successfully.');
      // Navigate back after alert is shown (2 seconds for success alerts)
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      setIsDeletingWorkout(false);
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      showError(message);
    }
  }, [router, user, workoutId, deleteWorkout, showSuccess, showError]);

  // Show loading state
  if (isLoading) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={colors.darkerGray}
      >
        <Text color={colors.white}>Loading workout...</Text>
      </YStack>
    );
  }

  // Render modals at top level so they persist even when workout state changes
  const modals = (
    <>
      <ConfirmationModal
        visible={isDeleteModalVisible}
        title="Delete Workout?"
        message="Are you sure you want to delete this workout? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        confirmButtonColor="#ef4444"
        cancelButtonColor={colors.midGray}
      />
      <AlertModalComponent />
    </>
  );

  // Show error state (but still render modals)
  if (isError && !isDeletingWorkout) {
    return (
      <>
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          backgroundColor={colors.darkerGray}
          padding="$4"
          space="$4"
        >
          <Text color={colors.white} fontSize="$5" textAlign="center">
            Failed to load workout
          </Text>
          <Button backgroundColor="$primaryButton" color={colors.white} onPress={() => refetch()}>
            Retry
          </Button>
          <Button
            backgroundColor={colors.midGray}
            color={colors.white}
            onPress={() => router.back()}
          >
            Go Back
          </Button>
        </YStack>
        {modals}
      </>
    );
  }

  if (!workout && !isDeletingWorkout) {
    return (
      <>
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          backgroundColor={colors.darkerGray}
        >
          <ActivityIndicator size="large" color={colors.niceOrange} />
        </YStack>
        {modals}
      </>
    );
  }

  // If deleting, just show loading with modals (workout might be null)
  if (isDeletingWorkout && !workout) {
    return (
      <>
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          backgroundColor={colors.darkerGray}
        >
          <ActivityIndicator size="large" color={colors.niceOrange} />
        </YStack>
        {modals}
      </>
    );
  }

  return (
    <>
      <EditWorkoutScreen
        workout={workout!}
        onUpdateWorkout={handleUpdateWorkout}
        onValidateWorkout={handleValidateWorkout}
        onUnvalidateWorkout={handleUnvalidateWorkout}
        onDeleteWorkout={handleDeleteWorkout}
        isUpdating={isUpdating}
        isValidating={isValidating || isUnvalidating || isDeleting}
        exerciseNavigationPath={exerciseNavigationPath}
      />
      {modals}
    </>
  );
}
