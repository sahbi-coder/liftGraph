/**
 * Exercise helper utilities for handling exercise types, allowed units, and categories
 */

export type AllowedUnit = 'load' | 'reps' | 'time' | 'distance';

/**
 * Checks if an exercise supports load (weight) units
 * @param allowedUnits - Array of allowed units for the exercise (can be string[] for flexibility)
 * @param defaultToTrue - If true, returns true when allowedUnits is undefined/null (for backwards compatibility)
 * @returns true if the exercise supports load units
 */
export function hasLoadUnit(
  allowedUnits?: string[] | AllowedUnit[],
  defaultToTrue = false,
): boolean {
  if (!allowedUnits) {
    return defaultToTrue;
  }
  return allowedUnits.includes('load');
}

/**
 * Checks if an exercise is a bodyweight exercise (only supports reps, no load)
 * @param allowedUnits - Array of allowed units for the exercise (can be string[] for flexibility)
 * @returns true if the exercise is bodyweight-only
 */
export function isBodyweightExercise(allowedUnits?: string[] | AllowedUnit[]): boolean {
  if (!allowedUnits || allowedUnits.length === 0) {
    return false;
  }
  // Bodyweight exercises only have 'reps', no 'load'
  return allowedUnits.length === 1 && allowedUnits[0] === 'reps';
}

/**
 * Gets the allowed units for an exercise based on its category
 * @param category - The exercise category (e.g., 'Bodyweight', 'Barbell', 'Dumbbell')
 * @returns Array of allowed units for the category
 */
export function getAllowedUnitsForCategory(category: string): AllowedUnit[] {
  const trimmedCategory = category.trim();
  if (trimmedCategory === 'Bodyweight') {
    return ['reps'];
  }
  // Default for most exercise types (Barbell, Dumbbell, Machine, Cable, etc.)
  return ['load', 'reps'];
}

/**
 * Checks if an exercise category is bodyweight
 * @param category - The exercise category
 * @returns true if the category is 'Bodyweight'
 */
export function isBodyweightCategory(category: string): boolean {
  return category.trim() === 'Bodyweight';
}
