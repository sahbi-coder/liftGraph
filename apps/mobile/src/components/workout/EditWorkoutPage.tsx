import React, { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { YStack, Text, Button } from 'tamagui';

import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/theme/colors';
import { EditWorkoutScreen } from '@/components/workout/EditWorkoutScreen';
import { useWorkout } from '@/hooks/useWorkout';
import { useWorkoutMutations } from '@/hooks/useWorkoutMutations';

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

  const handleUpdateWorkout = useCallback(
    async (workoutPayload: Parameters<typeof updateWorkout>[0]) => {
      if (!user || !workoutId) {
        Alert.alert('Not signed in', 'Please sign in to edit workouts.');
        return;
      }

      try {
        await updateWorkout(workoutPayload);
        Alert.alert('Workout updated', 'Your workout has been updated successfully.');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Something went wrong.';
        Alert.alert('Failed to update workout', message);
      }
    },
    [user, workoutId, updateWorkout],
  );

  const handleValidateWorkout = useCallback(async () => {
    if (!user || !workoutId) {
      Alert.alert('Not signed in', 'Please sign in to validate workouts.');
      return;
    }

    try {
      await validateWorkout();
      Alert.alert('Workout validated', 'Your workout has been marked as complete.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Failed to validate workout', message);
    }
  }, [router, user, workoutId, validateWorkout]);

  const handleUnvalidateWorkout = useCallback(async () => {
    if (!user || !workoutId) {
      Alert.alert('Not signed in', 'Please sign in to unvalidate workouts.');
      return;
    }

    try {
      await unvalidateWorkout();
      Alert.alert('Workout marked as incomplete', 'You can now edit this workout.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Failed to unvalidate workout', message);
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
    <EditWorkoutScreen
      workout={workout}
      onUpdateWorkout={handleUpdateWorkout}
      onValidateWorkout={handleValidateWorkout}
      onUnvalidateWorkout={handleUnvalidateWorkout}
      isUpdating={isUpdating}
      isValidating={isValidating || isUnvalidating}
    />
  );
}
