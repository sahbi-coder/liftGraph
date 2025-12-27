import { useMemo, useCallback } from 'react';
import type { WorkoutInput } from '@/services';
import { parseWeightInput } from '@/utils/units';
import type { ExerciseForm } from '@/components/workout/ExerciseCard';
import { hasLoadUnit } from '@/utils/exerciseHelpers';

type UseWorkoutValidationProps = {
  date: string;
  notes: string;
  exercises: ExerciseForm[];
  weightUnit: 'kg' | 'lb';
  t: (key: string, params?: Record<string, unknown>) => string;
};

export const useWorkoutValidation = ({
  date,
  notes,
  exercises,
  weightUnit,
  t,
}: UseWorkoutValidationProps) => {
  const buildWorkoutPayload = useCallback((): WorkoutInput => {
    if (!date) {
      throw new Error(t('workout.workoutDateRequired'));
    }

    const workoutDate = new Date(date);
    if (Number.isNaN(workoutDate.getTime())) {
      throw new Error(t('workout.workoutDateInvalid'));
    }

    if (exercises.length === 0) {
      throw new Error(t('workout.addAtLeastOneExercise'));
    }

    const workoutExercises = exercises.map((exercise, index) => {
      if (exercise.sets.length === 0) {
        throw new Error(t('workout.exerciseMustHaveSet', { name: exercise.name }));
      }

      const hasLoad = hasLoadUnit(exercise.allowedUnits, true); // Default to true for backwards compatibility

      return {
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        order: index + 1,
        sets: exercise.sets.map((set, setIndex) => {
          // Convert weight from display unit to kg (storage)
          const weight = parseWeightInput(set.weight, weightUnit);
          const reps = Number(set.reps);
          const rir = Number(set.rir);

          // For bodyweight exercises, weight validation is skipped
          if (hasLoad) {
            if (Number.isNaN(weight) || Number.isNaN(reps) || Number.isNaN(rir)) {
              throw new Error(
                t('workout.setRequiresNumericValues', {
                  setIndex: setIndex + 1,
                  exerciseName: exercise.name,
                }),
              );
            }
          } else {
            // For bodyweight exercises, only validate reps and rir
            if (Number.isNaN(reps) || Number.isNaN(rir)) {
              throw new Error(
                t('workout.setRequiresNumericValues', {
                  setIndex: setIndex + 1,
                  exerciseName: exercise.name,
                }),
              );
            }
          }

          // Validate reps is positive
          if (reps <= 0) {
            throw new Error(
              t('workout.repsMustBePositive', {
                setIndex: setIndex + 1,
                exerciseName: exercise.name,
              }),
            );
          }

          // Validate reps is a whole number
          if (!Number.isInteger(reps)) {
            throw new Error(
              t('workout.repsMustBeWholeNumber', {
                setIndex: setIndex + 1,
                exerciseName: exercise.name,
              }),
            );
          }

          // Validate weight is positive (only for exercises that use weight)
          if (hasLoad && weight <= 0) {
            throw new Error(
              t('workout.weightMustBePositive', {
                setIndex: setIndex + 1,
                exerciseName: exercise.name,
              }),
            );
          }

          // Validate RIR is between 0 and 10
          if (rir < 0 || rir > 10) {
            throw new Error(
              t('workout.rirMustBeBetween0And10', {
                setIndex: setIndex + 1,
                exerciseName: exercise.name,
              }),
            );
          }

          return {
            weight,
            reps,
            rir,
          };
        }),
      };
    });

    return {
      date: workoutDate,
      notes,
      exercises: workoutExercises,
    };
  }, [date, exercises, notes, weightUnit, t]);

  const isFormValid = useMemo(() => {
    try {
      if (!date) return false;
      const workoutDate = new Date(date);
      if (Number.isNaN(workoutDate.getTime())) return false;
      if (exercises.length === 0) return false;
      for (const exercise of exercises) {
        if (exercise.sets.length === 0) return false;
        const hasLoad = hasLoadUnit(exercise.allowedUnits);

        for (const set of exercise.sets) {
          // Parse weight considering weight unit
          const weight = parseWeightInput(set.weight, weightUnit);
          const reps = Number(set.reps);
          const rir = Number(set.rir);

          // Check if values are valid numbers
          // For bodyweight exercises, weight validation is skipped
          if (hasLoad) {
            if (Number.isNaN(weight) || Number.isNaN(reps) || Number.isNaN(rir)) {
              return false;
            }
          } else {
            // For bodyweight exercises, only validate reps and rir
            if (Number.isNaN(reps) || Number.isNaN(rir)) {
              return false;
            }
          }

          // Validate reps is positive
          if (reps <= 0) {
            return false;
          }

          // Validate reps is a whole number
          if (!Number.isInteger(reps)) {
            return false;
          }

          // Validate weight is positive (only for exercises that use weight)
          if (hasLoad && weight <= 0) {
            return false;
          }

          // Validate RIR is between 0 and 10
          if (rir < 0 || rir > 10) {
            return false;
          }
        }
      }
      return true;
    } catch {
      return false;
    }
  }, [date, exercises, weightUnit]);

  return {
    buildWorkoutPayload,
    isFormValid,
  };
};
