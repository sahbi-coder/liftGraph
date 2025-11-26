import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { WorkoutForm } from '@/components/workout/WorkoutForm';
import { useDependencies } from '@/dependencies/provider';
import { useAuth } from '@/contexts/AuthContext';
import { WorkoutInput } from '@/services/firestore';
import { getWorkoutPrefillData, clearWorkoutPrefillData } from '@/contexts/workoutPrefillContext';

export default function CreateWorkoutScreen() {
  const router = useRouter();
  const { services } = useDependencies();
  const { user } = useAuth();

  const [isSaving, setIsSaving] = useState(false);

  // Check for prefill data synchronously before first render
  const prefillData = getWorkoutPrefillData();
  const [initialExercises] = useState<WorkoutInput['exercises'] | undefined>(
    prefillData ? prefillData.exercises : undefined,
  );

  // Clear prefill data after reading it
  useEffect(() => {
    if (prefillData) {
      clearWorkoutPrefillData();
    }
  }, [prefillData]);

  const handleCreateWorkout = useCallback(
    async (workoutPayload: WorkoutInput) => {
      if (!user) {
        Alert.alert('Not signed in', 'Please sign in to save workouts.');
        return;
      }

      setIsSaving(true);
      try {
        await services.firestore.createWorkout(user.uid, workoutPayload);
        Alert.alert('Workout created', 'Your workout has been saved successfully.');
        router.back();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Something went wrong.';
        Alert.alert('Failed to save workout', message);
      } finally {
        setIsSaving(false);
      }
    },
    [router, services.firestore, user],
  );

  return (
    <WorkoutForm
      initialValues={initialExercises ? { exercises: initialExercises } : undefined}
      onSubmit={handleCreateWorkout}
      isSubmitting={isSaving}
      submitLabel="End Workout"
    />
  );
}
