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
): ExerciseForm => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  exerciseId: exercise.id,
  name: exercise.name,
  sets: [createSetForm(undefined, weightUnit)],
});

/**
 * Maps workout exercises to form format
 */
export const mapExercisesToForm = (
  exercises: WorkoutExercise[],
  weightUnit: 'kg' | 'lb' = 'kg',
): ExerciseForm[] =>
  exercises.map((exercise) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    exerciseId: exercise.exerciseId,
    name: exercise.name,
    sets: exercise.sets.map((set) => createSetForm(set, weightUnit)),
  }));
