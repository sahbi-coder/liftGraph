import type { WorkoutExercise } from '@/services';
import { ExerciseSelection } from '@/types/workout';
import { weightForDisplay } from './units';
import type { ExerciseForm, SetForm } from '@/components/workout/ExerciseCard';
import { hasLoadUnit } from './exerciseHelpers';
import { getAllowedUnitsForExercise } from './exerciseMapping';

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
  const hasLoad = hasLoadUnit(exercise.allowedUnits);
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
 * Uses exercise map to get allowedUnits, defaults to ['load', 'reps'] for backwards compatibility
 */
export const mapExercisesToForm = (
  exercises: WorkoutExercise[],
  weightUnit: 'kg' | 'lb' = 'kg',
  exerciseMap?: Map<string, { allowedUnits: string[] }>,
): ExerciseForm[] =>
  exercises.map((exercise) => {
    // Get allowedUnits from exercise map, with fallback to default
    const allowedUnits = getAllowedUnitsForExercise(exercise.exerciseId, exerciseMap);

    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      exerciseId: exercise.exerciseId,
      name: exercise.name,
      allowedUnits,
      sets: exercise.sets.map((set) => createSetForm(set, weightUnit)),
    };
  });
