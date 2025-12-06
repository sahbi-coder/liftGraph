// Temporary storage for pre-filled workout data from programs
import type { WorkoutExercise } from '@/services';

type WorkoutPrefillData = {
  exercises: WorkoutExercise[];
};

let workoutPrefillState: WorkoutPrefillData | null = null;

export const setWorkoutPrefillData = (exercises: WorkoutExercise[]) => {
  workoutPrefillState = {
    exercises,
  };
};

export const getWorkoutPrefillData = (): WorkoutPrefillData | null => {
  return workoutPrefillState;
};

export const clearWorkoutPrefillData = () => {
  workoutPrefillState = null;
};
