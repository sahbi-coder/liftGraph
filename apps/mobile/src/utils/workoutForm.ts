import type { WorkoutExercise } from '@/services';
import { ExerciseSelection } from '@/types/workout';
import { weightForDisplay } from './units';
import type { ExerciseForm, SetForm } from '@/components/workout/ExerciseCard';

/**
 * Creates a set form with optional initial values
 */
export const createSetForm = (
  set?: { weight: number; reps: number; rir: number },
  weightUnit: 'kg' | 'lb' = 'kg',
): SetForm => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  // Convert weight from kg (storage) to display unit
  weight: set ? String(weightForDisplay(set.weight, weightUnit)) : '0',
  reps: set ? String(set.reps) : '0',
  rir: set ? String(set.rir) : '0',
});

/**
 * Creates an exercise form from an exercise selection
 */
export const createExerciseForm = (
  exercise: ExerciseSelection,
  weightUnit: 'kg' | 'lb' = 'kg',
): ExerciseForm => {
  const hasLoad = exercise.allowedUnits.includes('load');
  const initialWeight = hasLoad ? undefined : { weight: 0, reps: 0, rir: 0 };

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    exerciseId: exercise.id,
    name: exercise.name,
    allowedUnits: exercise.allowedUnits,
    sets: [createSetForm(initialWeight, weightUnit)],
  };
};

/**
 * Maps workout exercises to form format
 * Note: allowedUnits defaults to ['load', 'reps'] for backwards compatibility
 * In the future, this could accept an exercise map to get actual allowedUnits
 */
export const mapExercisesToForm = (
  exercises: WorkoutExercise[],
  weightUnit: 'kg' | 'lb' = 'kg',
  exerciseMap?: Map<string, { allowedUnits: string[] }>,
): ExerciseForm[] =>
  exercises.map((exercise) => {
    // Try to get allowedUnits from exercise map, otherwise default to ['load', 'reps']
    const exerciseData = exerciseMap?.get(exercise.exerciseId);
    const allowedUnits = exerciseData?.allowedUnits ?? ['load', 'reps'];

    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      exerciseId: exercise.exerciseId,
      name: exercise.name,
      allowedUnits,
      sets: exercise.sets.map((set) => createSetForm(set, weightUnit)),
    };
  });
