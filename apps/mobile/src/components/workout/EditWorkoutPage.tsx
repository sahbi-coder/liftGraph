import React, { useCallback, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { YStack, Text, Button } from 'tamagui';

import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/theme/colors';
import { EditWorkoutScreen } from '@/components/workout/EditWorkoutScreen';
import { useWorkout } from '@/hooks/useWorkout';
import { useWorkoutMutations } from '@/hooks/useWorkoutMutations';
import { AlertModal } from '@/components/AlertModal';

export function EditWorkoutPage() {
  const router = useRouter();
  const { workoutId: workoutIdParam } = useLocalSearchParams<{ workoutId?: string | string[] }>();
  const workoutId = useMemo(() => {
    if (Array.isArray(workoutIdParam)) {
      return workoutIdParam[0];
    }
    return workoutIdParam;
  }, [workoutIdParam]);

  const { user } = useAuth();
  const { workout, isLoading, isError, refetch } = useWorkout(workoutId);
  const {
    updateWorkout,
    isUpdating,
    validateWorkout,
    isValidating,
    unvalidateWorkout,
    isUnvalidating,
  } = useWorkoutMutations(workoutId);

  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const handleUpdateWorkout = useCallback(
    async (workoutPayload: Parameters<typeof updateWorkout>[0]) => {
      if (!user || !workoutId) {
        setAlertModal({
          visible: true,
          message: 'Please sign in to edit workouts.',
          type: 'error',
        });
        return;
      }

      try {
        await updateWorkout(workoutPayload);
        setAlertModal({
          visible: true,
          message: 'Your workout has been updated successfully.',
          type: 'success',
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Something went wrong.';
        setAlertModal({
          visible: true,
          message,
          type: 'error',
        });
      }
    },
    [user, workoutId, updateWorkout],
  );

  const handleValidateWorkout = useCallback(async () => {
    if (!user || !workoutId) {
      setAlertModal({
        visible: true,
        message: 'Please sign in to validate workouts.',
        type: 'error',
      });
      return;
    }

    try {
      await validateWorkout();
      setAlertModal({
        visible: true,
        message: 'Your workout has been marked as complete.',
        type: 'success',
      });
      // Navigate back after showing success message
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      setAlertModal({
        visible: true,
        message,
        type: 'error',
      });
    }
  }, [router, user, workoutId, validateWorkout]);

  const handleUnvalidateWorkout = useCallback(async () => {
    if (!user || !workoutId) {
      setAlertModal({
        visible: true,
        message: 'Please sign in to unvalidate workouts.',
        type: 'error',
      });
      return;
    }

    try {
      await unvalidateWorkout();
      setAlertModal({
        visible: true,
        message: 'You can now edit this workout.',
        type: 'success',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      setAlertModal({
        visible: true,
        message,
        type: 'error',
      });
    }
  }, [user, workoutId, unvalidateWorkout]);

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

  // Show error state
  if (isError) {
    return (
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
        <Button backgroundColor={colors.midGray} color={colors.white} onPress={() => router.back()}>
          Go Back
        </Button>
      </YStack>
    );
  }

  if (!workout) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={colors.darkerGray}
        padding="$4"
        space="$4"
      >
        <Text color={colors.white} fontSize="$5" textAlign="center">
          Workout not found
        </Text>
        <Button backgroundColor={colors.midGray} color={colors.white} onPress={() => router.back()}>
          Go Back
        </Button>
      </YStack>
    );
  }

  return (
    <>
      <EditWorkoutScreen
        workout={workout}
        onUpdateWorkout={handleUpdateWorkout}
        onValidateWorkout={handleValidateWorkout}
        onUnvalidateWorkout={handleUnvalidateWorkout}
        isUpdating={isUpdating}
        isValidating={isValidating || isUnvalidating}
      />
      <AlertModal
        visible={alertModal.visible}
        message={alertModal.message}
        type={alertModal.type}
        duration={2000}
        onComplete={() => setAlertModal((prev) => ({ ...prev, visible: false }))}
      />
    </>
  );
}
