export type ExerciseSelection = {
  id: string;
  name: string;
  source: 'library' | 'user';
};

export type WorkoutStackParamList = {
  index: undefined;
  create: undefined;
  edit: { workoutId: string };
  exercises: {
    onSelect?: (exercise: ExerciseSelection) => void;
  };
};
