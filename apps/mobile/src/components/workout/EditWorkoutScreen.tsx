import React from 'react';

import { WorkoutForm } from '@/components/workout/WorkoutForm';
import type { Workout, WorkoutInput } from '@/services';
import { useTranslation } from '@/hooks/useTranslation';
import { useEditWorkoutFormState } from '@/hooks/useEditWorkoutFormState';
import { useWorkoutFormChanges } from '@/hooks/useWorkoutFormChanges';
import { useWorkoutFormInitialValues } from '@/hooks/useWorkoutFormInitialValues';

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
  const { t } = useTranslation();

  const { currentFormState, handleFormChange } = useEditWorkoutFormState({
    workoutId: workout.id,
    workoutUpdatedAt: workout.updatedAt,
    isUpdating,
  });

  const { hasUnsavedChanges, hasNoChanges } = useWorkoutFormChanges({
    currentFormState,
    workout,
  });

  const { initialValues, workoutKey } = useWorkoutFormInitialValues({ workout });

  return (
    <WorkoutForm
      initialValues={initialValues}
      onSubmit={onUpdateWorkout}
      onValidateWorkout={onValidateWorkout}
      onUnvalidateWorkout={onUnvalidateWorkout}
      onDeleteWorkout={onDeleteWorkout}
      isSubmitting={isUpdating || isValidating}
      submitLabel={t('workout.updateWorkout')}
      onFormChange={handleFormChange}
      disableValidateButton={hasUnsavedChanges}
      disableSubmitButton={hasNoChanges}
      workoutKey={workoutKey}
      exerciseNavigationPath={exerciseNavigationPath}
      currentWorkoutId={workout.id}
    />
  );
}
