import type { Workout, WorkoutExercise, WorkoutSet } from '@/services/firestore';

// Common Epley formula: 1RM = weight * (1 + reps / 30)
export function calculateEstimated1RM(weight: number, reps: number, rir: number): number {
  if (weight <= 0 || reps <= 0 || rir <= 0) {
    return 0;
  }

  return weight * (1 + (reps + rir) / 30);
}

export type ExerciseE1RMPoint = {
  date: Date;
  exerciseId: string;
  exerciseName: string;
  // best estimated 1RM for that exercise on that date
  estimated1RM: number;
};

function getExerciseSets(exercise: WorkoutExercise): WorkoutSet[] {
  return exercise.sets ?? [];
}

export function buildExerciseE1RMSeries(
  workouts: Workout[],
  exerciseId: string,
): ExerciseE1RMPoint[] {
  const points: ExerciseE1RMPoint[] = [];

  workouts.forEach((workout) => {
    let bestForWorkout = 0;
    let exerciseName = '';

    workout.exercises.forEach((exercise) => {
      if (exercise.exerciseId !== exerciseId) return;

      exerciseName = exercise.name;

      getExerciseSets(exercise).forEach((set) => {
        const e1rm = calculateEstimated1RM(set.weight, set.reps, set.rir);
        if (e1rm > bestForWorkout) {
          bestForWorkout = e1rm;
        }
      });
    });

    if (bestForWorkout > 0) {
      points.push({
        date: workout.date,
        exerciseId,
        exerciseName: exerciseName || 'Unknown exercise',
        estimated1RM: bestForWorkout,
      });
    }
  });

  // Sort chronologically
  return points.sort((a, b) => a.date.getTime() - b.date.getTime());
}
