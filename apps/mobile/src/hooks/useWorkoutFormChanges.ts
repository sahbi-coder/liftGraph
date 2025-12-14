import { useMemo } from 'react';
import type { Workout, WorkoutInput } from '@/services';
import { hasWorkoutChanges } from '@/utils/workout';

interface UseWorkoutFormChangesProps {
  currentFormState: WorkoutInput | null;
  workout: Workout;
}

/**
 * Detects if there are unsaved changes in the workout form.
 */
export function useWorkoutFormChanges({ currentFormState, workout }: UseWorkoutFormChangesProps) {
  const hasUnsavedChanges = useMemo(() => {
    if (!currentFormState) {
      return false;
    }
    return hasWorkoutChanges(currentFormState, workout);
  }, [currentFormState, workout]);

  // Disable submit button when there are no changes (converse of hasUnsavedChanges)
  const hasNoChanges = useMemo(() => {
    if (!currentFormState) {
      return true; // No form state yet, disable button
    }
    return !hasWorkoutChanges(currentFormState, workout);
  }, [currentFormState, workout]);

  return {
    hasUnsavedChanges,
    hasNoChanges,
  };
}
