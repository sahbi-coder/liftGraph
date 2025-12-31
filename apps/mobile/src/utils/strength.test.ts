/* eslint-disable import/first */
// Mock firebase/firestore first to prevent ESM parsing issues
jest.mock('firebase/firestore', () => ({
  Firestore: jest.fn(),
  Timestamp: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
}));

// Mock the services that use Firebase to prevent ESM parsing issues
jest.mock('@/services/user-profile', () => ({
  UserProfileService: jest.fn(),
}));
jest.mock('@/services/firestore', () => ({
  FirestoreService: jest.fn(),
}));
jest.mock('@/services/exercises', () => ({
  ExercisesService: jest.fn(),
}));
jest.mock('@/services/workouts', () => ({
  WorkoutsService: jest.fn(),
}));
jest.mock('@/services/programs', () => ({
  ProgramsService: jest.fn(),
}));

import type { Workout, WorkoutExercise, WorkoutSet } from '@/services';
import {
  calculateEstimated1RM,
  buildExerciseE1RMSeries,
  buildWorkoutTopSets,
  buildWeeklyExerciseVolumeByWeek,
  buildWeeklyExerciseFrequencyByWeek,
} from './strength';
/* eslint-enable import/first */

describe('calculateEstimated1RM', () => {
  it('should calculate estimated 1RM using Epley formula', () => {
    // Formula: 1RM = weight * (1 + (reps + rir) / 30)
    // weight = 100, reps = 5, rir = 2
    // 1RM = 100 * (1 + (5 + 2) / 30) = 100 * (1 + 7/30) = 100 * 1.233... = 123.33
    expect(calculateEstimated1RM(100, 5, 2)).toBeCloseTo(123.33, 2);
  });

  it('should handle single rep with RIR', () => {
    // weight = 100, reps = 1, rir = 0
    // Special case: returns weight directly when reps === 1 && rir === 0
    expect(calculateEstimated1RM(100, 1, 0)).toBe(100);
  });

  it('should handle high rep sets', () => {
    // weight = 50, reps = 10, rir = 2
    // 1RM = 50 * (1 + 12/30) = 50 * 1.4 = 70
    expect(calculateEstimated1RM(50, 10, 2)).toBe(70);
  });

  it('should return 0 for zero weight', () => {
    expect(calculateEstimated1RM(0, 5, 2)).toBe(0);
  });

  it('should return 0 for zero reps', () => {
    expect(calculateEstimated1RM(100, 0, 2)).toBe(0);
  });

  it('should calculate 1RM with zero RIR', () => {
    // weight = 100, reps = 5, rir = 0
    // 1RM = 100 * (1 + 5/30) = 100 * 1.166... = 116.67
    expect(calculateEstimated1RM(100, 5, 0)).toBeCloseTo(116.67, 2);
  });

  it('should return 0 for negative weight', () => {
    expect(calculateEstimated1RM(-10, 5, 2)).toBe(0);
  });

  it('should return 0 for negative reps', () => {
    expect(calculateEstimated1RM(100, -5, 2)).toBe(0);
  });

  it('should return 0 for negative RIR', () => {
    expect(calculateEstimated1RM(100, 5, -2)).toBe(0);
  });

  it('should handle decimal values', () => {
    // weight = 87.5, reps = 6, rir = 1.5
    // 1RM = 87.5 * (1 + (6 + 1.5) / 30) = 87.5 * (1 + 7.5/30) = 87.5 * 1.25 = 109.375
    expect(calculateEstimated1RM(87.5, 6, 1.5)).toBeCloseTo(109.38, 2);
  });
});

describe('buildExerciseE1RMSeries', () => {
  const createWorkout = (id: string, date: Date, exercises: WorkoutExercise[]): Workout => ({
    id,
    date,
    notes: '',
    exercises,
    validated: true,
    createdAt: date,
    updatedAt: date,
  });

  const createExercise = (
    exerciseId: string,
    name: string,
    sets: WorkoutSet[],
  ): WorkoutExercise => ({
    exerciseId,
    name,
    order: 0,
    sets,
  });

  const createSet = (weight: number, reps: number, rir: number): WorkoutSet => ({
    weight,
    reps,
    rir,
  });

  it('should build series for a single exercise across multiple workouts', () => {
    const date1 = new Date('2024-01-01');
    const date2 = new Date('2024-01-05');
    const date3 = new Date('2024-01-10');

    const workouts: Workout[] = [
      createWorkout('w1', date1, [
        createExercise('ex1', 'Bench Press', [
          createSet(100, 5, 2), // e1rm = 123.33
          createSet(90, 8, 1), // e1rm = 117
        ]),
      ]),
      createWorkout('w2', date2, [
        createExercise('ex1', 'Bench Press', [
          createSet(105, 5, 2), // e1rm = 129.35
        ]),
      ]),
      createWorkout('w3', date3, [
        createExercise('ex1', 'Bench Press', [
          createSet(95, 6, 1), // e1rm = 117.17
        ]),
      ]),
    ];

    const result = buildExerciseE1RMSeries(workouts, 'ex1');

    expect(result).toHaveLength(3);
    expect(result[0].date).toEqual(date1);
    expect(result[0].estimated1RM).toBeCloseTo(123.33, 2);
    expect(result[1].date).toEqual(date2);
    expect(result[1].estimated1RM).toBeCloseTo(129.5, 2);
    expect(result[2].date).toEqual(date3);
    expect(result[2].estimated1RM).toBeCloseTo(117.17, 2);
  });

  it('should filter by exerciseId', () => {
    const date = new Date('2024-01-01');
    const workouts: Workout[] = [
      createWorkout('w1', date, [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]),
        createExercise('ex2', 'Squat', [createSet(150, 5, 2)]),
      ]),
    ];

    const result = buildExerciseE1RMSeries(workouts, 'ex1');

    expect(result).toHaveLength(1);
    expect(result[0].exerciseId).toBe('ex1');
    expect(result[0].exerciseName).toBe('Bench Press');
  });

  it('should return best e1rm per workout when multiple sets exist', () => {
    const date = new Date('2024-01-01');
    const workouts: Workout[] = [
      createWorkout('w1', date, [
        createExercise('ex1', 'Bench Press', [
          createSet(100, 5, 2), // e1rm = 123.33
          createSet(110, 3, 1), // e1rm = 114.67
          createSet(95, 8, 1), // e1rm = 123.5 (changed rir from 0 to 1 since rir=0 returns 0)
        ]),
      ]),
    ];

    const result = buildExerciseE1RMSeries(workouts, 'ex1');

    expect(result).toHaveLength(1);
    // Best e1rm is 124.67 (from set with 110, 3, 1)
    expect(result[0].estimated1RM).toBeCloseTo(124.67, 2);
  });

  it('should return empty array when no workouts match exerciseId', () => {
    const workouts: Workout[] = [
      createWorkout('w1', new Date('2024-01-01'), [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]),
      ]),
    ];

    const result = buildExerciseE1RMSeries(workouts, 'ex2');

    expect(result).toHaveLength(0);
  });

  it('should return empty array for empty workouts', () => {
    const result = buildExerciseE1RMSeries([], 'ex1');
    expect(result).toHaveLength(0);
  });

  it('should handle workouts with no sets', () => {
    const workouts: Workout[] = [
      createWorkout('w1', new Date('2024-01-01'), [
        {
          exerciseId: 'ex1',
          name: 'Bench Press',
          order: 0,
          sets: [],
        },
      ]),
    ];

    const result = buildExerciseE1RMSeries(workouts, 'ex1');
    expect(result).toHaveLength(0);
  });

  it('should sort results chronologically', () => {
    const date1 = new Date('2024-01-10');
    const date2 = new Date('2024-01-01');
    const date3 = new Date('2024-01-05');

    const workouts: Workout[] = [
      createWorkout('w1', date1, [createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)])]),
      createWorkout('w2', date2, [createExercise('ex1', 'Bench Press', [createSet(90, 5, 2)])]),
      createWorkout('w3', date3, [createExercise('ex1', 'Bench Press', [createSet(95, 5, 2)])]),
    ];

    const result = buildExerciseE1RMSeries(workouts, 'ex1');

    expect(result).toHaveLength(3);
    expect(result[0].date).toEqual(date2);
    expect(result[1].date).toEqual(date3);
    expect(result[2].date).toEqual(date1);
  });

  it('should use "Unknown exercise" when exercise name is missing', () => {
    const workouts: Workout[] = [
      createWorkout('w1', new Date('2024-01-01'), [
        {
          exerciseId: 'ex1',
          name: '',
          order: 0,
          sets: [createSet(100, 5, 2)],
        },
      ]),
    ];

    const result = buildExerciseE1RMSeries(workouts, 'ex1');

    expect(result).toHaveLength(1);
    expect(result[0].exerciseName).toBe('Unknown exercise');
  });
});

describe('buildWorkoutTopSets', () => {
  const createWorkout = (id: string, date: Date, exercises: WorkoutExercise[]): Workout => ({
    id,
    date,
    notes: '',
    exercises,
    validated: true,
    createdAt: date,
    updatedAt: date,
  });

  const createExercise = (
    exerciseId: string,
    name: string,
    sets: WorkoutSet[],
  ): WorkoutExercise => ({
    exerciseId,
    name,
    order: 0,
    sets,
  });

  const createSet = (weight: number, reps: number, rir: number): WorkoutSet => ({
    weight,
    reps,
    rir,
  });

  it('should find heaviest set per exercise', () => {
    const date = new Date('2024-01-01');
    const workouts: Workout[] = [
      createWorkout('w1', date, [
        createExercise('ex1', 'Bench Press', [
          createSet(100, 5, 2),
          createSet(110, 3, 1), // heaviest
          createSet(95, 8, 0),
        ]),
      ]),
    ];

    const result = buildWorkoutTopSets(workouts);

    expect(result).toHaveLength(1);
    expect(result[0].set.weight).toBe(110);
    expect(result[0].setIndex).toBe(1);
  });

  it('should handle multiple exercises in one workout', () => {
    const date = new Date('2024-01-01');
    const workouts: Workout[] = [
      createWorkout('w1', date, [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2), createSet(110, 3, 1)]),
        createExercise('ex2', 'Squat', [createSet(150, 5, 2), createSet(160, 3, 1)]),
      ]),
    ];

    const result = buildWorkoutTopSets(workouts);

    expect(result).toHaveLength(2);
    expect(result[0].exerciseId).toBe('ex1');
    expect(result[0].set.weight).toBe(110);
    expect(result[1].exerciseId).toBe('ex2');
    expect(result[1].set.weight).toBe(160);
  });

  it('should handle multiple workouts', () => {
    const date1 = new Date('2024-01-01');
    const date2 = new Date('2024-01-05');
    const workouts: Workout[] = [
      createWorkout('w1', date1, [createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)])]),
      createWorkout('w2', date2, [createExercise('ex1', 'Bench Press', [createSet(110, 5, 2)])]),
    ];

    const result = buildWorkoutTopSets(workouts);

    expect(result).toHaveLength(2);
    expect(result[0].workoutId).toBe('w1');
    expect(result[0].set.weight).toBe(100);
    expect(result[1].workoutId).toBe('w2');
    expect(result[1].set.weight).toBe(110);
  });

  it('should pick first occurrence when multiple sets have same weight', () => {
    const date = new Date('2024-01-01');
    const workouts: Workout[] = [
      createWorkout('w1', date, [
        createExercise('ex1', 'Bench Press', [
          createSet(100, 5, 2),
          createSet(100, 8, 1), // same weight, different reps
          createSet(100, 3, 0),
        ]),
      ]),
    ];

    const result = buildWorkoutTopSets(workouts);

    expect(result).toHaveLength(1);
    expect(result[0].setIndex).toBe(0);
    expect(result[0].set.reps).toBe(5);
  });

  it('should skip exercises with no sets', () => {
    const date = new Date('2024-01-01');
    const workouts: Workout[] = [
      createWorkout('w1', date, [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]),
        {
          exerciseId: 'ex2',
          name: 'Squat',
          order: 1,
          sets: [],
        },
      ]),
    ];

    const result = buildWorkoutTopSets(workouts);

    expect(result).toHaveLength(1);
    expect(result[0].exerciseId).toBe('ex1');
  });

  it('should return empty array for empty workouts', () => {
    const result = buildWorkoutTopSets([]);
    expect(result).toHaveLength(0);
  });

  it('should include all top set metadata', () => {
    const date = new Date('2024-01-01');
    const workouts: Workout[] = [
      createWorkout('w1', date, [createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)])]),
    ];

    const result = buildWorkoutTopSets(workouts);

    expect(result[0]).toMatchObject({
      workoutId: 'w1',
      date,
      exerciseId: 'ex1',
      exerciseName: 'Bench Press',
      setIndex: 0,
      set: {
        weight: 100,
        reps: 5,
        rir: 2,
      },
    });
  });
});

describe('buildWeeklyExerciseVolumeByWeek', () => {
  const createWorkout = (id: string, date: Date, exercises: WorkoutExercise[]): Workout => ({
    id,
    date,
    notes: '',
    exercises,
    validated: true,
    createdAt: date,
    updatedAt: date,
  });

  const createExercise = (
    exerciseId: string,
    name: string,
    sets: WorkoutSet[],
  ): WorkoutExercise => ({
    exerciseId,
    name,
    order: 0,
    sets,
  });

  const createSet = (weight: number, reps: number, rir: number): WorkoutSet => ({
    weight,
    reps,
    rir,
  });

  it('should calculate weekly volume correctly', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-14'); // 2 weeks

    const workouts: Workout[] = [
      createWorkout('w1', new Date('2024-01-02'), [
        createExercise('ex1', 'Bench Press', [
          createSet(100, 5, 2), // volume = 500
          createSet(100, 5, 2), // volume = 500
        ]), // total = 1000
      ]),
      createWorkout('w2', new Date('2024-01-09'), [
        createExercise('ex1', 'Bench Press', [
          createSet(110, 5, 2), // volume = 550
        ]), // total = 550
      ]),
    ];

    const result = buildWeeklyExerciseVolumeByWeek(workouts, startDate, endDate);

    expect(result).toHaveLength(2);
    expect(result[0].weekIndex).toBe(0);
    expect(result[0].totalVolume).toBe(1000);
    expect(result[1].weekIndex).toBe(1);
    expect(result[1].totalVolume).toBe(550);
  });

  it('should handle multiple exercises in same week', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-07');

    const workouts: Workout[] = [
      createWorkout('w1', new Date('2024-01-02'), [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]), // 500
        createExercise('ex2', 'Squat', [createSet(150, 5, 2)]), // 750
      ]),
    ];

    const result = buildWeeklyExerciseVolumeByWeek(workouts, startDate, endDate);

    expect(result).toHaveLength(2);
    expect(result.find((p) => p.exerciseId === 'ex1')?.totalVolume).toBe(500);
    expect(result.find((p) => p.exerciseId === 'ex2')?.totalVolume).toBe(750);
  });

  it('should accumulate volume for same exercise across multiple workouts in same week', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-07');

    const workouts: Workout[] = [
      createWorkout('w1', new Date('2024-01-02'), [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]), // 500
      ]),
      createWorkout('w2', new Date('2024-01-04'), [
        createExercise('ex1', 'Bench Press', [createSet(110, 5, 2)]), // 550
      ]),
    ];

    const result = buildWeeklyExerciseVolumeByWeek(workouts, startDate, endDate);

    expect(result).toHaveLength(1);
    expect(result[0].totalVolume).toBe(1050);
  });

  it('should filter workouts outside date range', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-07');

    const workouts: Workout[] = [
      createWorkout('w1', new Date('2023-12-30'), [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]),
      ]),
      createWorkout('w2', new Date('2024-01-02'), [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]),
      ]),
      createWorkout('w3', new Date('2024-01-08'), [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]),
      ]),
    ];

    const result = buildWeeklyExerciseVolumeByWeek(workouts, startDate, endDate);

    expect(result).toHaveLength(1);
    expect(result[0].totalVolume).toBe(500);
  });

  it('should handle workouts with string dates', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-07');

    const workouts: Workout[] = [
      {
        id: 'w1',
        date: '2024-01-02' as any,
        notes: '',
        exercises: [createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)])],
        validated: true,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
    ];

    const result = buildWeeklyExerciseVolumeByWeek(workouts, startDate, endDate);

    expect(result).toHaveLength(1);
    expect(result[0].totalVolume).toBe(500);
  });

  it('should skip exercises with zero or negative volume', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-07');

    const workouts: Workout[] = [
      createWorkout('w1', new Date('2024-01-02'), [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]), // 500
        createExercise('ex2', 'Squat', [createSet(0, 5, 2)]), // 0 - should be skipped
        createExercise('ex3', 'Deadlift', []), // empty sets - should be skipped
      ]),
    ];

    const result = buildWeeklyExerciseVolumeByWeek(workouts, startDate, endDate);

    expect(result).toHaveLength(1);
    expect(result[0].exerciseId).toBe('ex1');
  });

  it('should return empty array for empty workouts', () => {
    const result = buildWeeklyExerciseVolumeByWeek(
      [],
      new Date('2024-01-01'),
      new Date('2024-01-07'),
    );
    expect(result).toHaveLength(0);
  });

  it('should return empty array when end date is before start date', () => {
    const workouts: Workout[] = [
      createWorkout('w1', new Date('2024-01-02'), [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]),
      ]),
    ];

    const result = buildWeeklyExerciseVolumeByWeek(
      workouts,
      new Date('2024-01-07'),
      new Date('2024-01-01'),
    );

    expect(result).toHaveLength(0);
  });

  it('should sort results by weekIndex', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-21'); // 3 weeks

    const workouts: Workout[] = [
      createWorkout('w1', new Date('2024-01-15'), [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]),
      ]),
      createWorkout('w2', new Date('2024-01-02'), [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]),
      ]),
      createWorkout('w3', new Date('2024-01-09'), [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]),
      ]),
    ];

    const result = buildWeeklyExerciseVolumeByWeek(workouts, startDate, endDate);

    expect(result).toHaveLength(3);
    expect(result[0].weekIndex).toBe(0);
    expect(result[1].weekIndex).toBe(1);
    expect(result[2].weekIndex).toBe(2);
  });
});

describe('buildWeeklyExerciseFrequencyByWeek', () => {
  const createWorkout = (id: string, date: Date, exercises: WorkoutExercise[]): Workout => ({
    id,
    date,
    notes: '',
    exercises,
    validated: true,
    createdAt: date,
    updatedAt: date,
  });

  const createExercise = (
    exerciseId: string,
    name: string,
    sets: WorkoutSet[],
  ): WorkoutExercise => ({
    exerciseId,
    name,
    order: 0,
    sets,
  });

  const createSet = (weight: number, reps: number, rir: number): WorkoutSet => ({
    weight,
    reps,
    rir,
  });

  it('should count sessions per week correctly', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-14'); // 2 weeks

    const workouts: Workout[] = [
      createWorkout('w1', new Date('2024-01-02'), [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]),
      ]),
      createWorkout('w2', new Date('2024-01-09'), [
        createExercise('ex1', 'Bench Press', [createSet(110, 5, 2)]),
      ]),
    ];

    const result = buildWeeklyExerciseFrequencyByWeek(workouts, startDate, endDate);

    expect(result).toHaveLength(2);
    expect(result[0].weekIndex).toBe(0);
    expect(result[0].sessions).toBe(1);
    expect(result[1].weekIndex).toBe(1);
    expect(result[1].sessions).toBe(1);
  });

  it('should count multiple sessions in same week', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-07');

    const workouts: Workout[] = [
      createWorkout('w1', new Date('2024-01-02'), [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]),
      ]),
      createWorkout('w2', new Date('2024-01-04'), [
        createExercise('ex1', 'Bench Press', [createSet(110, 5, 2)]),
      ]),
    ];

    const result = buildWeeklyExerciseFrequencyByWeek(workouts, startDate, endDate);

    expect(result).toHaveLength(1);
    expect(result[0].sessions).toBe(2);
  });

  it('should not double-count same exercise in same workout', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-07');

    const workouts: Workout[] = [
      createWorkout('w1', new Date('2024-01-02'), [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]),
        createExercise('ex1', 'Bench Press', [createSet(110, 5, 2)]), // same exerciseId
      ]),
    ];

    const result = buildWeeklyExerciseFrequencyByWeek(workouts, startDate, endDate);

    expect(result).toHaveLength(1);
    expect(result[0].sessions).toBe(1); // should count as 1 session, not 2
  });

  it('should handle multiple exercises in same week', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-07');

    const workouts: Workout[] = [
      createWorkout('w1', new Date('2024-01-02'), [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]),
        createExercise('ex2', 'Squat', [createSet(150, 5, 2)]),
      ]),
    ];

    const result = buildWeeklyExerciseFrequencyByWeek(workouts, startDate, endDate);

    expect(result).toHaveLength(2);
    expect(result.find((p) => p.exerciseId === 'ex1')?.sessions).toBe(1);
    expect(result.find((p) => p.exerciseId === 'ex2')?.sessions).toBe(1);
  });

  it('should filter workouts outside date range', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-07');

    const workouts: Workout[] = [
      createWorkout('w1', new Date('2023-12-30'), [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]),
      ]),
      createWorkout('w2', new Date('2024-01-02'), [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]),
      ]),
      createWorkout('w3', new Date('2024-01-08'), [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]),
      ]),
    ];

    const result = buildWeeklyExerciseFrequencyByWeek(workouts, startDate, endDate);

    expect(result).toHaveLength(1);
    expect(result[0].sessions).toBe(1);
  });

  it('should handle workouts with string dates', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-07');

    const workouts: Workout[] = [
      {
        id: 'w1',
        date: '2024-01-02' as any,
        notes: '',
        exercises: [createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)])],
        validated: true,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
    ];

    const result = buildWeeklyExerciseFrequencyByWeek(workouts, startDate, endDate);

    expect(result).toHaveLength(1);
    expect(result[0].sessions).toBe(1);
  });

  it('should return empty array for empty workouts', () => {
    const result = buildWeeklyExerciseFrequencyByWeek(
      [],
      new Date('2024-01-01'),
      new Date('2024-01-07'),
    );
    expect(result).toHaveLength(0);
  });

  it('should return empty array when end date is before start date', () => {
    const workouts: Workout[] = [
      createWorkout('w1', new Date('2024-01-02'), [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]),
      ]),
    ];

    const result = buildWeeklyExerciseFrequencyByWeek(
      workouts,
      new Date('2024-01-07'),
      new Date('2024-01-01'),
    );

    expect(result).toHaveLength(0);
  });

  it('should sort results by weekIndex', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-21'); // 3 weeks

    const workouts: Workout[] = [
      createWorkout('w1', new Date('2024-01-15'), [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]),
      ]),
      createWorkout('w2', new Date('2024-01-02'), [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]),
      ]),
      createWorkout('w3', new Date('2024-01-09'), [
        createExercise('ex1', 'Bench Press', [createSet(100, 5, 2)]),
      ]),
    ];

    const result = buildWeeklyExerciseFrequencyByWeek(workouts, startDate, endDate);

    expect(result).toHaveLength(3);
    expect(result[0].weekIndex).toBe(0);
    expect(result[1].weekIndex).toBe(1);
    expect(result[2].weekIndex).toBe(2);
  });
});
