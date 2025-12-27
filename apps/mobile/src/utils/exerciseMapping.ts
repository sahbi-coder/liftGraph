import type { Exercise } from '@/services';

/**
 * Default allowed units for exercises (backwards compatibility)
 */
export const DEFAULT_ALLOWED_UNITS = ['load', 'reps'] as const;

/**
 * Creates a map of exercise IDs to their allowedUnits for quick lookup
 * @param exercises - Array of exercises
 * @returns Map of exercise ID to allowedUnits, or undefined if exercises array is empty/undefined
 */
export function createExerciseMap(
  exercises?: Exercise[],
): Map<string, { allowedUnits: string[] }> | undefined {
  if (!exercises || exercises.length === 0) {
    return undefined;
  }

  return new Map(exercises.map((ex) => [ex.id, { allowedUnits: ex.allowedUnits }]));
}

/**
 * Gets the allowed units for an exercise, with fallback to default
 * @param exerciseId - The exercise ID
 * @param exerciseMap - Map of exercise ID to allowedUnits
 * @returns Array of allowed units, or default if not found in map
 */
export function getAllowedUnitsForExercise(
  exerciseId: string,
  exerciseMap?: Map<string, { allowedUnits: string[] }>,
): string[] {
  const exerciseData = exerciseMap?.get(exerciseId);
  return exerciseData?.allowedUnits ?? [...DEFAULT_ALLOWED_UNITS];
}
