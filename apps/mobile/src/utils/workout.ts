import type { Workout, WorkoutInput } from '@/domain';
import dayjs from 'dayjs';

/**
 * Compares a WorkoutInput with a Workout to determine if they are different.
 * Ignores id, validated, createdAt, and updatedAt fields.
 * @param workoutInput - The current form state
 * @param originalWorkout - The original workout from the database
 * @returns true if the workouts are different, false if they are the same
 */
export function hasWorkoutChanges(workoutInput: WorkoutInput, originalWorkout: Workout): boolean {
  // Compare date (normalize to day for comparison)
  const inputDate = dayjs(workoutInput.date).startOf('day');
  const originalDate = dayjs(originalWorkout.date).startOf('day');
  if (!inputDate.isSame(originalDate)) {
    return true;
  }

  // Compare notes (handle undefined/null)
  const inputNotes = workoutInput.notes ?? '';
  const originalNotes = originalWorkout.notes ?? '';
  if (inputNotes.trim() !== originalNotes.trim()) {
    return true;
  }

  // Compare exercises count
  if (workoutInput.exercises.length !== originalWorkout.exercises.length) {
    return true;
  }

  // Compare each exercise
  for (let i = 0; i < workoutInput.exercises.length; i++) {
    const inputExercise = workoutInput.exercises[i];
    const originalExercise = originalWorkout.exercises[i];

    // Compare exercise IDs and names
    if (
      inputExercise.exerciseId !== originalExercise.exerciseId ||
      inputExercise.name !== originalExercise.name ||
      inputExercise.exerciseOwnerId !== originalExercise.exerciseOwnerId
    ) {
      return true;
    }

    // Compare sets count
    if (inputExercise.sets.length !== originalExercise.sets.length) {
      return true;
    }

    // Compare each set
    for (let j = 0; j < inputExercise.sets.length; j++) {
      const inputSet = inputExercise.sets[j];
      const originalSet = originalExercise.sets[j];

      if (
        inputSet.weight !== originalSet.weight ||
        inputSet.reps !== originalSet.reps ||
        inputSet.rir !== originalSet.rir
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Filters workouts to only include validated ones.
 * @param workouts - Array of workouts (can be null or undefined)
 * @returns Array of validated workouts
 */
export function getValidatedWorkouts(workouts: Workout[] | null | undefined): Workout[] {
  return (workouts ?? []).filter((workout) => workout.validated);
}
