import React from 'react';

import { WorkoutForm } from '@/components/workout/WorkoutForm';
import type { Workout, WorkoutInput } from '@/services/firestore';

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
    />
  );
}
