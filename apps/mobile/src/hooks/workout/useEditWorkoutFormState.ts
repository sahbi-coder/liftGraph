import { useState, useEffect, useCallback } from 'react';
import type { WorkoutInput } from '@/services';

interface UseEditWorkoutFormStateProps {
  workoutId: string;
  workoutUpdatedAt: Date;
  isUpdating: boolean;
}

/**
 * Manages form state for editing a workout.
 * Resets form state when workout is updated (after successful save).
 */
export function useEditWorkoutFormState({
  workoutId,
  workoutUpdatedAt,
  isUpdating,
}: UseEditWorkoutFormStateProps) {
  const [currentFormState, setCurrentFormState] = useState<WorkoutInput | null>(null);

  // Reset form state when workout is updated (after successful save)
  useEffect(() => {
    if (!isUpdating) {
      setCurrentFormState(null);
    }
  }, [workoutId, workoutUpdatedAt, isUpdating]);

  const handleFormChange = useCallback((payload: WorkoutInput | null) => {
    setCurrentFormState(payload);
  }, []);

  return {
    currentFormState,
    handleFormChange,
  };
}
