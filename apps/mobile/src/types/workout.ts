export type ExerciseSelection = {
  id: string;
  name: string;
};

export type ExerciseSelectionContext = {
  weekId?: string;
  phaseId?: string;
  [key: string]: string | undefined;
};

export type WorkoutStackParamList = {
  edit: { workoutId: string };
  exercises: {
    onSelect: (exercise: ExerciseSelection) => void;
  };
};
