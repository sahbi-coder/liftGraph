import type { Workout, WorkoutExercise, WorkoutSet } from '@/domain';

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

export type WorkoutTopSet = {
  workoutId: string;
  date: Date;
  exerciseId: string;
  exerciseName: string;
  setIndex: number;
  set: WorkoutSet;
};

/**
 * Build a flat list of "top sets" from a list of workouts.
 * For each workout exercise, we treat the heaviest set (by weight) as the top set.
 */
export function buildWorkoutTopSets(workouts: Workout[]): WorkoutTopSet[] {
  const topSets: WorkoutTopSet[] = [];

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const sets = getExerciseSets(exercise);
      if (!sets.length) return;

      // Find the heaviest set by weight; if multiple, pick the first occurrence
      let bestIndex = 0;
      let bestWeight = sets[0].weight;

      sets.forEach((set, idx) => {
        if (set.weight > bestWeight) {
          bestWeight = set.weight;
          bestIndex = idx;
        }
      });

      const setIndex = bestIndex;
      const set = sets[setIndex];

      topSets.push({
        workoutId: workout.id,
        date: workout.date,
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.name,
        setIndex,
        set,
      });
    });
  });

  return topSets;
}

export type WeeklyExerciseVolumePoint = {
  weekIndex: number;
  exerciseId: string;
  exerciseName: string;
  totalVolume: number;
};

export type WeeklyExerciseFrequencyPoint = {
  weekIndex: number;
  exerciseId: string;
  exerciseName: string;
  sessions: number;
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

/**
 * For a given date range, compute weekly volume (weight × reps) per exercise.
 * Weeks are contiguous 7-day buckets starting from the provided startDate.
 */
export function buildWeeklyExerciseVolumeByWeek(
  workouts: Workout[],
  startDate: Date,
  endDate: Date,
): WeeklyExerciseVolumePoint[] {
  if (!workouts.length) return [];

  const msPerDay = 24 * 60 * 60 * 1000;
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);

  if (end < start) {
    return [];
  }

  const totalDays = Math.floor((end.getTime() - start.getTime()) / msPerDay);
  const numberOfWeeks = Math.floor(totalDays / 7) + 1;

  // Prepare buckets
  const weekBuckets: Map<
    string,
    { exerciseId: string; exerciseName: string; totalVolume: number }
  >[] = [];

  for (let i = 0; i < numberOfWeeks; i += 1) {
    weekBuckets.push(new Map());
  }

  // Fill buckets with volumes
  workouts.forEach((workout) => {
    const workoutDate = startOfDay(
      typeof workout.date === 'string' ? new Date(workout.date) : workout.date,
    );

    if (workoutDate < start || workoutDate > end) {
      return;
    }

    const daysFromStart = Math.floor((workoutDate.getTime() - start.getTime()) / msPerDay);
    const weekIndex = Math.floor(daysFromStart / 7);

    const bucket = weekBuckets[weekIndex];
    if (!bucket) return;

    workout.exercises.forEach((exercise) => {
      const exerciseVolume = exercise.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
      if (exerciseVolume <= 0) return;

      const key = exercise.exerciseId;
      const existing = bucket.get(key);

      if (existing) {
        existing.totalVolume += exerciseVolume;
      } else {
        bucket.set(key, {
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.name,
          totalVolume: exerciseVolume,
        });
      }
    });
  });

  // Flatten into points: one entry per (week, exercise)
  const points: WeeklyExerciseVolumePoint[] = [];

  weekBuckets.forEach((bucket, index) => {
    bucket.forEach((value) => {
      points.push({
        weekIndex: index,
        exerciseId: value.exerciseId,
        exerciseName: value.exerciseName,
        totalVolume: value.totalVolume,
      });
    });
  });

  // Sort by weekIndex ascending so callers can easily group/plot
  return points.sort((a, b) => a.weekIndex - b.weekIndex);
}

/**
 * For a given date range, compute weekly exercise frequency (sessions per week) per exercise.
 * A "session" is counted once per workout day if the exercise appears at least once.
 */
export function buildWeeklyExerciseFrequencyByWeek(
  workouts: Workout[],
  startDate: Date,
  endDate: Date,
): WeeklyExerciseFrequencyPoint[] {
  if (!workouts.length) return [];

  const msPerDay = 24 * 60 * 60 * 1000;
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);

  if (end < start) {
    return [];
  }

  const totalDays = Math.floor((end.getTime() - start.getTime()) / msPerDay);
  const numberOfWeeks = Math.floor(totalDays / 7) + 1;

  // Prepare buckets
  const weekBuckets: Map<string, { exerciseId: string; exerciseName: string; sessions: number }>[] =
    [];

  for (let i = 0; i < numberOfWeeks; i += 1) {
    weekBuckets.push(new Map());
  }

  workouts.forEach((workout) => {
    const workoutDate = startOfDay(
      typeof workout.date === 'string' ? new Date(workout.date) : workout.date,
    );

    if (workoutDate < start || workoutDate > end) {
      return;
    }

    const daysFromStart = Math.floor((workoutDate.getTime() - start.getTime()) / msPerDay);
    const weekIndex = Math.floor(daysFromStart / 7);

    const bucket = weekBuckets[weekIndex];
    if (!bucket) return;

    // Track which exercises we've already counted for this workout (avoid double-counting)
    const seenInWorkout = new Set<string>();

    workout.exercises.forEach((exercise) => {
      const key = exercise.exerciseId;
      if (seenInWorkout.has(key)) return;
      seenInWorkout.add(key);

      const existing = bucket.get(key);

      if (existing) {
        existing.sessions += 1;
      } else {
        bucket.set(key, {
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.name,
          sessions: 1,
        });
      }
    });
  });

  const points: WeeklyExerciseFrequencyPoint[] = [];

  weekBuckets.forEach((bucket, index) => {
    bucket.forEach((value) => {
      points.push({
        weekIndex: index,
        exerciseId: value.exerciseId,
        exerciseName: value.exerciseName,
        sessions: value.sessions,
      });
    });
  });

  return points.sort((a, b) => a.weekIndex - b.weekIndex);
}
