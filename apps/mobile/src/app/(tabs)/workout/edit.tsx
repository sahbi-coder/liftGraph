import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { YStack, Text } from 'tamagui';

import { WorkoutForm } from '@/components/workout/WorkoutForm';
import { useDependencies } from '@/dependencies/provider';
import { useAuth } from '@/contexts/AuthContext';
import { Workout, WorkoutInput } from '@/services/firestore';
import { colors } from '@/theme/colors';

export default function EditWorkoutScreen() {
  const router = useRouter();
  const { workoutId: workoutIdParam } = useLocalSearchParams<{ workoutId?: string | string[] }>();
  const workoutId = useMemo(() => {
    if (Array.isArray(workoutIdParam)) {
      return workoutIdParam[0];
    }
    return workoutIdParam;
  }, [workoutIdParam]);

  const { services } = useDependencies();
  const { user } = useAuth();

  const [initialWorkout, setInitialWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (!workoutId) {
      Alert.alert('Invalid workout', 'Workout ID is missing.');
      router.back();
    }
  }, [router, workoutId]);

  useEffect(() => {
    if (!user || !workoutId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchWorkout = async () => {
      try {
        const workout = await services.firestore.getWorkout(user.uid, workoutId);

        if (!isMounted) {
          return;
        }

        if (!workout) {
          Alert.alert('Workout not found', 'We could not find that workout.');
          router.back();
          return;
        }

        setInitialWorkout(workout);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Unable to load workout.';
        Alert.alert('Failed to load workout', message);
        router.back();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchWorkout();

    return () => {
      isMounted = false;
    };
  }, [router, services.firestore, user, workoutId]);

  const handleUpdateWorkout = useCallback(
    async (workoutPayload: WorkoutInput) => {
      if (!user || !workoutId) {
        Alert.alert('Not signed in', 'Please sign in to edit workouts.');
        return;
      }

      setIsSaving(true);
      try {
        await services.firestore.updateWorkout(user.uid, workoutId, workoutPayload);
        Alert.alert('Workout updated', 'Your workout has been updated successfully.');
        router.back();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Something went wrong.';
        Alert.alert('Failed to update workout', message);
      } finally {
        setIsSaving(false);
      }
    },
    [router, services.firestore, user, workoutId],
  );

  const handleValidateWorkout = useCallback(async () => {
    if (!user || !workoutId) {
      Alert.alert('Not signed in', 'Please sign in to validate workouts.');
      return;
    }

    setIsValidating(true);
    try {
      await services.firestore.validateWorkout(user.uid, workoutId);
      Alert.alert('Workout validated', 'Your workout has been marked as complete.');
      // Refresh the workout data
      const updatedWorkout = await services.firestore.getWorkout(user.uid, workoutId);
      if (updatedWorkout) {
        setInitialWorkout(updatedWorkout);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Failed to validate workout', message);
    } finally {
      setIsValidating(false);
    }
  }, [services.firestore, user, workoutId]);

  const handleUnvalidateWorkout = useCallback(async () => {
    if (!user || !workoutId) {
      Alert.alert('Not signed in', 'Please sign in to unvalidate workouts.');
      return;
    }

    setIsValidating(true);
    try {
      await services.firestore.unvalidateWorkout(user.uid, workoutId);
      Alert.alert('Workout marked as incomplete', 'You can now edit this workout.');
      // Refresh the workout data
      const updatedWorkout = await services.firestore.getWorkout(user.uid, workoutId);
      if (updatedWorkout) {
        setInitialWorkout(updatedWorkout);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Failed to unvalidate workout', message);
    } finally {
      setIsValidating(false);
    }
  }, [services.firestore, user, workoutId]);

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
          Please sign in to edit workouts.
        </Text>
      </YStack>
    );
  }

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

  if (!initialWorkout) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={colors.darkerGray}
        padding="$4"
      >
        <Text color={colors.white} fontSize="$5" textAlign="center">
          Workout could not be loaded.
        </Text>
      </YStack>
    );
  }

  return (
    <WorkoutForm
      initialValues={{
        date: initialWorkout.date,
        notes: initialWorkout.notes,
        exercises: initialWorkout.exercises,
        validated: initialWorkout.validated,
      }}
      onSubmit={handleUpdateWorkout}
      onValidateWorkout={handleValidateWorkout}
      onUnvalidateWorkout={handleUnvalidateWorkout}
      isSubmitting={isSaving || isValidating}
      submitLabel="Update Workout"
    />
  );
}
