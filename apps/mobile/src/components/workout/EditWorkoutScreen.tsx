import React, { useCallback, useState, useMemo, useEffect } from 'react';

import { WorkoutForm } from '@/components/workout/WorkoutForm';
import type { Workout, WorkoutInput } from '@/services/firestore';
import { hasWorkoutChanges } from '@/utils/workout';

type EditWorkoutScreenProps = {
  workout: Workout;
  onUpdateWorkout: (workout: WorkoutInput) => Promise<void>;
  onValidateWorkout: () => Promise<void>;
  onUnvalidateWorkout: () => Promise<void>;
  isUpdating: boolean;
  isValidating: boolean;
};

export function EditWorkoutScreen({
  workout,
  onUpdateWorkout,
  onValidateWorkout,
  onUnvalidateWorkout,
  isUpdating,
  isValidating,
}: EditWorkoutScreenProps) {
  const [currentFormState, setCurrentFormState] = useState<WorkoutInput | null>(null);

  // Reset form state when workout is updated (after successful save)
  useEffect(() => {
    if (!isUpdating) {
      setCurrentFormState(null);
    }
  }, [workout.id, workout.updatedAt, isUpdating]);

  const handleFormChange = useCallback((payload: WorkoutInput | null) => {
    setCurrentFormState(payload);
  }, []);

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

  return (
    <WorkoutForm
      initialValues={{
        date: workout.date,
        notes: workout.notes,
        exercises: workout.exercises,
        validated: workout.validated,
      }}
      onSubmit={onUpdateWorkout}
      onValidateWorkout={onValidateWorkout}
      onUnvalidateWorkout={onUnvalidateWorkout}
      isSubmitting={isUpdating || isValidating}
      submitLabel="Update Workout"
      onFormChange={handleFormChange}
      disableValidateButton={hasUnsavedChanges}
      disableSubmitButton={hasNoChanges}
    />
  );
}
