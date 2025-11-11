import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { WorkoutForm } from '@/components/workout/WorkoutForm';
import { useDependencies } from '@/dependencies/provider';
import { useAuth } from '@/contexts/AuthContext';
import { WorkoutInput } from '@/services/firestore';

export default function CreateWorkoutScreen() {
  const router = useRouter();
  const { services } = useDependencies();
  const { user } = useAuth();

  const [isSaving, setIsSaving] = useState(false);

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
    <WorkoutForm onSubmit={handleCreateWorkout} isSubmitting={isSaving} submitLabel="End Workout" />
  );
}
