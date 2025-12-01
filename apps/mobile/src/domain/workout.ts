export type WorkoutSet = {
  weight: number;
  reps: number;
  rir: number;
};

export type WorkoutExercise = {
  exerciseId: string;
  exerciseOwnerId: string | null;
  name: string;
  order: number;
  sets: WorkoutSet[];
};

export type WorkoutInput = {
  date: Date;
  notes?: string;
  exercises: WorkoutExercise[];
};

export type Workout = {
  id: string;
  date: Date;
  notes: string;
  exercises: WorkoutExercise[];
  validated: boolean;
  createdAt: Date;
  updatedAt: Date;
};
