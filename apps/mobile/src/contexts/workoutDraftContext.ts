// Temporary storage for workout draft data
import type { WorkoutInput } from '@/services';

type WorkoutDraftData = {
  date?: string;
  notes?: string;
  exercises?: WorkoutInput['exercises'];
};

let workoutDraftState: WorkoutDraftData | null = null;

export const setWorkoutDraft = (draft: WorkoutDraftData) => {
  workoutDraftState = draft;
};

export const getWorkoutDraft = (): WorkoutDraftData | null => {
  return workoutDraftState;
};

export const clearWorkoutDraft = () => {
  workoutDraftState = null;
};
