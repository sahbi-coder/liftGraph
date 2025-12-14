import { useCallback, useEffect, useRef } from 'react';
import type { ExerciseSelection } from '@/types/workout';
import { createSetForm, createExerciseForm } from '@/utils/workoutForm';
import { parseWeightInput, kgToLb, lbToKg } from '@/utils/units';
import type { ExerciseForm, SetForm } from '@/components/workout/ExerciseCard';

type UseWorkoutExercisesProps = {
  exercises: ExerciseForm[];
  setExercises: React.Dispatch<React.SetStateAction<ExerciseForm[]>>;
  weightUnit: 'kg' | 'lb';
  validated: boolean;
  onShowWarning: (message: string) => void;
};

export const useWorkoutExercises = ({
  exercises,
  setExercises,
  weightUnit,
  validated,
  onShowWarning,
}: UseWorkoutExercisesProps) => {
  const previousWeightUnitRef = useRef<'kg' | 'lb'>(weightUnit);

  // Convert weights when weight unit changes
  useEffect(() => {
    const previousUnit = previousWeightUnitRef.current;

    // Only convert if unit actually changed and we have exercises
    if (previousUnit !== weightUnit && exercises.length > 0) {
      setExercises((prevExercises) =>
        prevExercises.map((exercise) => ({
          ...exercise,
          sets: exercise.sets.map((set) => {
            const weightValue = set.weight.trim();

            // Skip empty weights
            if (!weightValue) {
              return set;
            }

            const numValue = parseFloat(weightValue);
            if (isNaN(numValue)) {
              return set;
            }

            // Convert from previous unit to kg, then to new unit
            let weightInKg: number;
            if (previousUnit === 'lb') {
              weightInKg = lbToKg(numValue);
            } else {
              weightInKg = numValue;
            }

            // Convert from kg to new unit
            let newWeight: number;
            if (weightUnit === 'lb') {
              newWeight = kgToLb(weightInKg);
            } else {
              newWeight = weightInKg;
            }

            return {
              ...set,
              weight: String(newWeight),
            };
          }),
        })),
      );
    }

    // Update the ref to track current unit
    previousWeightUnitRef.current = weightUnit;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weightUnit]);

  const handleSelectExercise = useCallback(
    (exercise: ExerciseSelection) => {
      if (validated) return;
      setExercises((prev) => [...prev, createExerciseForm(exercise, weightUnit)]);
    },
    [validated, weightUnit, setExercises],
  );

  const handleRemoveExercise = useCallback(
    (exerciseId: string) => {
      if (validated) return;
      setExercises((prev) => prev.filter((exercise) => exercise.id !== exerciseId));
    },
    [validated, setExercises],
  );

  const handleAddSet = useCallback(
    (exerciseId: string) => {
      if (validated) return;
      setExercises((prev) =>
        prev.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, sets: [...exercise.sets, createSetForm(undefined, weightUnit)] }
            : exercise,
        ),
      );
    },
    [validated, weightUnit, setExercises],
  );

  const handleDuplicatePreviousSet = useCallback(
    (exerciseId: string) => {
      if (validated) return;
      setExercises((prev) =>
        prev.map((exercise) => {
          if (exercise.id !== exerciseId || exercise.sets.length === 0) {
            return exercise;
          }

          const lastSet = exercise.sets[exercise.sets.length - 1];
          // Parse the weight from display unit back to kg, then create new set
          const weightInKg = parseWeightInput(lastSet.weight, weightUnit);
          const duplicatedSet = createSetForm(
            {
              weight: weightInKg,
              reps: lastSet.reps ? Number(lastSet.reps) : 0,
              rir: lastSet.rir ? Number(lastSet.rir) : 0,
            },
            weightUnit,
          );

          return {
            ...exercise,
            sets: [...exercise.sets, duplicatedSet],
          };
        }),
      );
    },
    [validated, weightUnit, setExercises],
  );

  const handleRemoveSet = useCallback(
    (exerciseId: string, setId: string, warningMessage: string) => {
      if (validated) return;
      setExercises((prev) =>
        prev.map((exercise) => {
          if (exercise.id !== exerciseId) {
            return exercise;
          }

          if (exercise.sets.length === 1) {
            onShowWarning(warningMessage);
            return exercise;
          }

          return {
            ...exercise,
            sets: exercise.sets.filter((set) => set.id !== setId),
          };
        }),
      );
    },
    [validated, setExercises, onShowWarning],
  );

  const handleUpdateSetField = useCallback(
    (exerciseId: string, setId: string, field: keyof Omit<SetForm, 'id'>, value: string) => {
      if (validated) return;
      setExercises((prev) =>
        prev.map((exercise) => {
          if (exercise.id !== exerciseId) {
            return exercise;
          }

          return {
            ...exercise,
            sets: exercise.sets.map((set) =>
              set.id === setId
                ? {
                    ...set,
                    [field]: value,
                  }
                : set,
            ),
          };
        }),
      );
    },
    [validated, setExercises],
  );

  return {
    handleSelectExercise,
    handleRemoveExercise,
    handleAddSet,
    handleDuplicatePreviousSet,
    handleRemoveSet,
    handleUpdateSetField,
  };
};
