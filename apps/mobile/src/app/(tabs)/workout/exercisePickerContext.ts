// Temporary storage for exercise selection callbacks across stacks
import type { ExerciseSelection, ExerciseSelectionContext } from './types';

type ExerciseCallback = (exercise: ExerciseSelection, context?: ExerciseSelectionContext) => void;

type ExercisePickerContext = {
  callback: ExerciseCallback | null;
  context: ExerciseSelectionContext | null;
  returnPath: string | null;
};

let exercisePickerState: ExercisePickerContext = {
  callback: null,
  context: null,
  returnPath: null,
};

export const setExercisePickerCallback = (
  callback: ExerciseCallback,
  context?: ExerciseSelectionContext,
  returnPath?: string,
) => {
  exercisePickerState = {
    callback,
    context: context || null,
    returnPath: returnPath || null,
  };
};

export const getExercisePickerCallback = (): ExercisePickerContext => {
  return exercisePickerState;
};

export const clearExercisePickerCallback = () => {
  exercisePickerState = {
    callback: null,
    context: null,
    returnPath: null,
  };
};
