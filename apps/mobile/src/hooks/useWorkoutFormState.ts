import { useState, useEffect, useRef } from 'react';
import type { WorkoutExercise } from '@/services';
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
};

export const useWorkoutFormState = ({
  initialValues,
  workoutKey,
  weightUnit,
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
  const [exercises, setExercises] = useState<ExerciseForm[]>(() =>
    initialValues?.exercises ? mapExercisesToForm(initialValues.exercises, weightUnit) : [],
  );

  // Track the workout key to detect when we're loading a different workout
  const initializedWorkoutKeyRef = useRef<string | null | undefined>(workoutKey);

  // Only initialize/reset when loading a different workout (different workoutKey)
  useEffect(() => {
    // If this is a new workout (different key), reset the form
    if (workoutKey !== undefined && workoutKey !== initializedWorkoutKeyRef.current) {
      if (initialValues?.exercises) {
        setExercises(mapExercisesToForm(initialValues.exercises, weightUnit));
      }
      if (initialValues?.notes !== undefined) {
        setNotes(initialValues.notes);
      }
      initializedWorkoutKeyRef.current = workoutKey;
    } else if (workoutKey === undefined && initializedWorkoutKeyRef.current !== undefined) {
      // Clear form if workoutKey was cleared (create mode)
      if (initialValues?.exercises) {
        setExercises(mapExercisesToForm(initialValues.exercises, weightUnit));
      } else {
        setExercises([]);
      }
      setNotes(initialValues?.notes ?? '');
      initializedWorkoutKeyRef.current = undefined;
    }
  }, [workoutKey, initialValues?.exercises, initialValues?.notes, weightUnit]);

  return {
    date,
    setDate,
    notes,
    setNotes,
    exercises,
    setExercises,
  };
};
