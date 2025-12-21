import { useCallback, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import type { WorkoutInput } from '@/services';
import type { ExerciseForm } from '@/components/workout/ExerciseCard';
import { useUserWorkouts } from './useUserWorkouts';
import { getServiceErrorMessage } from '@/utils/serviceErrors';
import { useTranslation } from '../common/useTranslation';

type UseWorkoutSubmissionProps = {
  buildWorkoutPayload: () => WorkoutInput;
  onSubmit: (payload: WorkoutInput) => Promise<void> | void;
  validated: boolean;
  date: string;
  notes: string;
  exercises: ExerciseForm[];
  onFormChange?: (payload: WorkoutInput | null) => void;
  currentWorkoutId?: string;
  onShowWarning: (message: string) => void;
  onShowError: (message: string) => void;
};

export const useWorkoutSubmission = ({
  buildWorkoutPayload,
  onSubmit,
  validated,
  date,
  notes,
  exercises,
  onFormChange,
  currentWorkoutId,
  onShowWarning,
  onShowError,
}: UseWorkoutSubmissionProps) => {
  const { workouts } = useUserWorkouts();
  const { t } = useTranslation();
  const previousFormValuesRef = useRef<string>('');

  // Notify parent of form changes
  useEffect(() => {
    if (!onFormChange) return;

    // Create a stable key from form values to detect actual changes
    const formKey = JSON.stringify({
      date,
      notes,
      exercises: exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        name: ex.name,
        sets: ex.sets.map((set) => ({
          weight: set.weight,
          reps: set.reps,
          rir: set.rir,
        })),
      })),
    });

    // Only notify if values actually changed
    if (formKey === previousFormValuesRef.current) {
      return;
    }

    previousFormValuesRef.current = formKey;

    try {
      const payload = buildWorkoutPayload();
      onFormChange(payload);
    } catch {
      // Form is invalid, notify parent with null
      onFormChange(null);
    }
  }, [date, notes, exercises, onFormChange, buildWorkoutPayload]);

  const handleSubmit = useCallback(async () => {
    if (validated) {
      onShowWarning(t('workout.workoutValidatedCannotModify'));
      return;
    }

    let workoutPayload: WorkoutInput;

    try {
      workoutPayload = buildWorkoutPayload();
    } catch (error) {
      const message = getServiceErrorMessage(error, t);
      onShowError(message);
      return;
    }

    // Check if there's already a workout on this date
    if (workouts && workouts.length > 0) {
      const selectedDate = workoutPayload.date;
      const selectedDateKey = dayjs(selectedDate).format('YYYY-MM-DD');

      const conflictingWorkout = workouts.find((workout) => {
        // Exclude the current workout if we're editing
        if (currentWorkoutId && workout.id === currentWorkoutId) {
          return false;
        }
        const workoutDateKey = dayjs(workout.date).format('YYYY-MM-DD');
        return workoutDateKey === selectedDateKey;
      });

      if (conflictingWorkout) {
        onShowWarning(t('workout.workoutAlreadyExistsOnDate'));
        return;
      }
    }

    try {
      await onSubmit(workoutPayload);
    } catch (error) {
      const message = getServiceErrorMessage(error, t);
      onShowError(message);
    }
  }, [
    buildWorkoutPayload,
    onSubmit,
    validated,
    workouts,
    currentWorkoutId,
    onShowWarning,
    onShowError,
    t,
  ]);

  return {
    handleSubmit,
  };
};
