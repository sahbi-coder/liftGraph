import { useState, useEffect, useRef } from 'react';
import type { WorkoutExercise, Exercise } from '@/services';
import { mapExercisesToForm } from '@/utils/workoutForm';
import type { ExerciseForm } from '@/components/workout/ExerciseCard';

type UseWorkoutFormStateProps = {
  initialValues?: {
    date?: Date | string;
    notes?: string;
    exercises?: WorkoutExercise[];
  };
  workoutKey?: string;
  weightUnit: 'kg' | 'lb';
  exercises?: Exercise[]; // Optional exercise data to get allowedUnits
};

export const useWorkoutFormState = ({
  initialValues,
  workoutKey,
  weightUnit,
  exercises: exerciseData,
}: UseWorkoutFormStateProps) => {
  const [date, setDate] = useState(() => {
    if (!initialValues?.date) {
      return new Date().toUTCString();
    }

    if (initialValues.date instanceof Date) {
      return initialValues.date.toUTCString();
    }

    return initialValues.date;
  });

  const [notes, setNotes] = useState(initialValues?.notes ?? '');

  // Create exercise map for allowedUnits lookup
  const exerciseMap = exerciseData
    ? new Map(exerciseData.map((ex) => [ex.id, { allowedUnits: ex.allowedUnits }]))
    : undefined;

  const [exercises, setExercises] = useState<ExerciseForm[]>(() =>
    initialValues?.exercises
      ? mapExercisesToForm(initialValues.exercises, weightUnit, exerciseMap)
      : [],
  );

  // Track the workout key to detect when we're loading a different workout
  const initializedWorkoutKeyRef = useRef<string | null | undefined>(workoutKey);

  // Only initialize/reset when loading a different workout (different workoutKey)
  useEffect(() => {
    // Recreate exercise map when exerciseData changes
    const currentExerciseMap = exerciseData
      ? new Map(exerciseData.map((ex) => [ex.id, { allowedUnits: ex.allowedUnits }]))
      : undefined;

    // If this is a new workout (different key), reset the form
    if (workoutKey !== undefined && workoutKey !== initializedWorkoutKeyRef.current) {
      if (initialValues?.exercises) {
        setExercises(mapExercisesToForm(initialValues.exercises, weightUnit, currentExerciseMap));
      }
      if (initialValues?.notes !== undefined) {
        setNotes(initialValues.notes);
      }
      initializedWorkoutKeyRef.current = workoutKey;
    } else if (workoutKey === undefined && initializedWorkoutKeyRef.current !== undefined) {
      // Clear form if workoutKey was cleared (create mode)
      if (initialValues?.exercises) {
        setExercises(mapExercisesToForm(initialValues.exercises, weightUnit, currentExerciseMap));
      } else {
        setExercises([]);
      }
      setNotes(initialValues?.notes ?? '');
      initializedWorkoutKeyRef.current = undefined;
    }
    // Also update exercises when exerciseData loads/changes (to update allowedUnits)
    // This ensures bodyweight exercises hide weight field even after exercises load
    else if (initialValues?.exercises && exerciseData) {
      setExercises(mapExercisesToForm(initialValues.exercises, weightUnit, currentExerciseMap));
    }
  }, [workoutKey, initialValues?.exercises, initialValues?.notes, weightUnit, exerciseData]);

  return {
    date,
    setDate,
    notes,
    setNotes,
    exercises,
    setExercises,
  };
};
