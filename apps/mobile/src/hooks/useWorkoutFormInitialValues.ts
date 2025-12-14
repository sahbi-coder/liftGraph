import { useMemo } from 'react';
import type { Workout } from '@/services';

interface UseWorkoutFormInitialValuesProps {
  workout: Workout;
}

/**
 * Provides memoized initial values and workout key for the workout form.
 * The workout key ensures the form resets when switching between different workouts.
 */
export function useWorkoutFormInitialValues({ workout }: UseWorkoutFormInitialValuesProps) {
  // Memoize initialValues to prevent unnecessary re-renders and form resets
  const initialValues = useMemo(
    () => ({
      date: workout.date,
      notes: workout.notes,
      exercises: workout.exercises,
      validated: workout.validated,
    }),
    [workout.id, workout.updatedAt],
  );

  // Create a stable workout key that only changes when workout actually changes
  const workoutKey = useMemo(
    () => `${workout.id}-${workout.updatedAt.getTime()}`,
    [workout.id, workout.updatedAt],
  );

  return {
    initialValues,
    workoutKey,
  };
}
