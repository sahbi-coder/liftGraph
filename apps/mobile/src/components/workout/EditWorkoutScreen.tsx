import React, { useCallback, useState, useMemo, useEffect } from 'react';

import { WorkoutForm } from '@/components/workout/WorkoutForm';
import type { Workout, WorkoutInput } from '@/domain';
import { hasWorkoutChanges } from '@/utils/workout';

type EditWorkoutScreenProps = {
  workout: Workout;
  onUpdateWorkout: (workout: WorkoutInput) => Promise<void>;
  onValidateWorkout: () => Promise<void>;
  onUnvalidateWorkout: () => Promise<void>;
  onDeleteWorkout: () => void;
  isUpdating: boolean;
  isValidating: boolean;
  exerciseNavigationPath: string;
};

export function EditWorkoutScreen({
  workout,
  onUpdateWorkout,
  onValidateWorkout,
  onUnvalidateWorkout,
  onDeleteWorkout,
  isUpdating,
  isValidating,
  exerciseNavigationPath,
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

  return (
    <WorkoutForm
      initialValues={initialValues}
      onSubmit={onUpdateWorkout}
      onValidateWorkout={onValidateWorkout}
      onUnvalidateWorkout={onUnvalidateWorkout}
      onDeleteWorkout={onDeleteWorkout}
      isSubmitting={isUpdating || isValidating}
      submitLabel="Update Workout"
      onFormChange={handleFormChange}
      disableValidateButton={hasUnsavedChanges}
      disableSubmitButton={hasNoChanges}
      workoutKey={workoutKey}
      exerciseNavigationPath={exerciseNavigationPath}
      currentWorkoutId={workout.id}
    />
  );
}
