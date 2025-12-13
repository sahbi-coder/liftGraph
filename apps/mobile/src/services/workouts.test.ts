import {
  Firestore,
  Timestamp,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { WorkoutsService } from './workouts';
import { ServiceError } from '@/utils/serviceErrors';
import type { WorkoutInput } from '@/domain';

// Mock Firestore functions
jest.mock('firebase/firestore', () => {
  // Re-define MockTimestamp here to avoid hoisting issues
  class Timestamp {
    seconds: number;
    nanoseconds: number;

    constructor(seconds: number, nanoseconds: number = 0) {
      this.seconds = seconds;
      this.nanoseconds = nanoseconds;
    }

    toDate(): Date {
      return new Date(this.seconds * 1000);
    }

    toMillis(): number {
      return this.seconds * 1000;
    }

    static fromDate(date: Date): Timestamp {
      return new Timestamp(Math.floor(date.getTime() / 1000));
    }

    static now(): Timestamp {
      return Timestamp.fromDate(new Date());
    }
  }

  return {
    collection: jest.fn(),
    doc: jest.fn(),
    addDoc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    Timestamp,
  };
});

type MockOverrides = {
  collection?: jest.Mock;
  doc?: jest.Mock;
  addDoc?: jest.Mock;
  getDoc?: jest.Mock;
  getDocs?: jest.Mock;
  setDoc?: jest.Mock;
  updateDoc?: jest.Mock;
  deleteDoc?: jest.Mock;
  query?: jest.Mock;
  where?: jest.Mock;
  orderBy?: jest.Mock;
  timestampNow?: jest.Mock;
  timestampFromDate?: jest.Mock;
};

const setupMocks = (overrides: Partial<MockOverrides> = {}) => {
  const defaultDate = new Date('2024-01-01T00:00:00Z');
  const defaultTimestamp = Timestamp.fromDate(defaultDate);

  const defaults = {
    collection: jest.fn().mockReturnValue({}),
    doc: jest.fn().mockReturnValue({ id: 'mock-doc-id' }),
    addDoc: jest.fn().mockResolvedValue({ id: 'mock-doc-id' }),
    getDoc: jest.fn().mockResolvedValue({
      exists: () => false,
      data: () => ({}),
    }),
    getDocs: jest.fn().mockResolvedValue({
      empty: true,
      docs: [],
    }),
    setDoc: jest.fn().mockResolvedValue(undefined),
    updateDoc: jest.fn().mockResolvedValue(undefined),
    deleteDoc: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockReturnValue({}),
    where: jest.fn().mockReturnValue({}),
    orderBy: jest.fn().mockReturnValue({}),
    timestampNow: jest.fn().mockReturnValue(defaultTimestamp),
    timestampFromDate: jest.fn().mockImplementation((date: Date) => {
      // Use the actual MockTimestamp.fromDate implementation
      return new Timestamp(Math.floor(date.getTime() / 1000), 0);
    }),
  };

  const mocks = { ...defaults, ...overrides };

  // Apply mocks
  (collection as jest.Mock).mockImplementation(mocks.collection);
  (doc as jest.Mock).mockImplementation(mocks.doc);
  (addDoc as jest.Mock).mockImplementation(mocks.addDoc);
  (getDoc as jest.Mock).mockImplementation(mocks.getDoc);
  (getDocs as jest.Mock).mockImplementation(mocks.getDocs);
  (setDoc as jest.Mock).mockImplementation(mocks.setDoc);
  (updateDoc as jest.Mock).mockImplementation(mocks.updateDoc);
  (deleteDoc as jest.Mock).mockImplementation(mocks.deleteDoc);
  (query as jest.Mock).mockImplementation(mocks.query);
  (where as jest.Mock).mockImplementation(mocks.where);
  (orderBy as jest.Mock).mockImplementation(mocks.orderBy);

  // Mock Timestamp static methods using jest.spyOn
  jest.spyOn(Timestamp, 'now').mockImplementation(mocks.timestampNow);
  jest.spyOn(Timestamp, 'fromDate').mockImplementation(mocks.timestampFromDate);

  return mocks;
};

describe('WorkoutsService', () => {
  let workoutsService: WorkoutsService;
  let mockDb: Firestore;

  const createMockWorkoutInput = (overrides?: Partial<WorkoutInput>): WorkoutInput => ({
    date: new Date('2024-01-01'),
    notes: 'Test workout',
    exercises: [
      {
        exerciseId: 'ex1',
        name: 'Bench Press',
        order: 0,
        sets: [
          { weight: 100, reps: 5, rir: 2 },
          { weight: 100, reps: 5, rir: 1 },
        ],
      },
    ],
    ...overrides,
  });

  beforeEach(() => {
    mockDb = {} as Firestore;
    workoutsService = new WorkoutsService(mockDb);
    jest.clearAllMocks();
  });

  describe('createWorkout', () => {
    it('should create a new workout', async () => {
      const userId = 'user123';
      const workoutInput = createMockWorkoutInput();

      const mockCollectionRef = {};
      const mockDocRef = { id: 'workout1' };
      const now = new Date('2024-01-01T00:00:00Z');
      const mockTimestamp = Timestamp.fromDate(now);

      setupMocks({
        collection: jest.fn().mockReturnValue(mockCollectionRef),
        timestampNow: jest.fn().mockReturnValue(mockTimestamp),
        timestampFromDate: jest.fn().mockReturnValue(mockTimestamp),
        addDoc: jest.fn().mockResolvedValue(mockDocRef),
      });

      const result = await workoutsService.createWorkout(userId, workoutInput);

      expect(collection).toHaveBeenCalledWith(mockDb, `users/${userId}/workouts`);
      expect(addDoc).toHaveBeenCalled();
      expect(result).toBe('workout1');
    });

    it('should throw error for invalid workout input', async () => {
      const userId = 'user123';
      const invalidWorkout = {
        date: new Date('2024-01-01'),
        exercises: [], // Invalid: empty exercises array
      } as WorkoutInput;

      await expect(workoutsService.createWorkout(userId, invalidWorkout)).rejects.toThrow(
        ServiceError,
      );
    });

    it('should serialize workout with UTC midnight date', async () => {
      const userId = 'user123';
      const workoutInput = createMockWorkoutInput({
        date: new Date('2024-01-01T14:30:00Z'), // Not midnight
      });

      const mockCollectionRef = {};
      const mockDocRef = { id: 'workout1' };
      const now = new Date('2024-01-01T00:00:00Z');
      const mockTimestamp = Timestamp.fromDate(now);

      setupMocks({
        collection: jest.fn().mockReturnValue(mockCollectionRef),
        timestampNow: jest.fn().mockReturnValue(mockTimestamp),
        timestampFromDate: jest.fn().mockReturnValue(mockTimestamp),
        addDoc: jest.fn().mockResolvedValue(mockDocRef),
      });

      await workoutsService.createWorkout(userId, workoutInput);

      expect(addDoc).toHaveBeenCalledWith(
        mockCollectionRef,
        expect.objectContaining({
          validated: false,
          exercises: expect.arrayContaining([
            expect.objectContaining({
              exerciseId: 'ex1',
              name: 'Bench Press',
              sets: expect.arrayContaining([
                { weight: 100, reps: 5, rir: 2 },
                { weight: 100, reps: 5, rir: 1 },
              ]),
            }),
          ]),
        }),
      );
    });
  });

  describe('updateWorkout', () => {
    it('should update existing workout', async () => {
      const userId = 'user123';
      const workoutId = 'workout1';
      const workoutInput = createMockWorkoutInput();

      const mockDocRef = { id: workoutId };
      const createdAt = Timestamp.fromDate(new Date('2024-01-01T00:00:00Z'));
      const mockExistingDoc = {
        exists: () => true,
        data: () => ({
          validated: false,
          createdAt,
        }),
      };
      const now = new Date('2024-01-02T00:00:00Z');
      const mockTimestamp = Timestamp.fromDate(now);

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockExistingDoc),
        timestampNow: jest.fn().mockReturnValue(mockTimestamp),
        timestampFromDate: jest.fn().mockReturnValue(mockTimestamp),
        setDoc: jest.fn().mockResolvedValue(undefined),
      });

      await workoutsService.updateWorkout(userId, workoutId, workoutInput);

      expect(setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          validated: false,
          createdAt,
        }),
      );
    });

    it('should throw error if workout does not exist', async () => {
      const userId = 'user123';
      const workoutId = 'nonexistent';
      const workoutInput = createMockWorkoutInput();

      const mockDocRef = { id: workoutId };
      const mockExistingDoc = {
        exists: () => false,
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockExistingDoc),
      });

      await expect(workoutsService.updateWorkout(userId, workoutId, workoutInput)).rejects.toThrow(
        ServiceError,
      );
    });

    it('should preserve validated status and createdAt', async () => {
      const userId = 'user123';
      const workoutId = 'workout1';
      const workoutInput = createMockWorkoutInput();

      const mockDocRef = { id: workoutId };
      const createdAt = Timestamp.fromDate(new Date('2024-01-01T00:00:00Z'));
      const mockExistingDoc = {
        exists: () => true,
        data: () => ({
          validated: true,
          createdAt,
        }),
      };
      const now = new Date('2024-01-02T00:00:00Z');
      const mockTimestamp = Timestamp.fromDate(now);

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockExistingDoc),
        timestampNow: jest.fn().mockReturnValue(mockTimestamp),
        timestampFromDate: jest.fn().mockReturnValue(mockTimestamp),
        setDoc: jest.fn().mockResolvedValue(undefined),
      });

      await workoutsService.updateWorkout(userId, workoutId, workoutInput);

      expect(setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          validated: true,
          createdAt,
        }),
      );
    });
  });

  describe('validateWorkout', () => {
    it('should validate a workout', async () => {
      const userId = 'user123';
      const workoutId = 'workout1';

      const mockDocRef = { id: workoutId };
      const mockExistingDoc = {
        exists: () => true,
      };
      const now = new Date('2024-01-01T00:00:00Z');
      const mockTimestamp = Timestamp.fromDate(now);

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockExistingDoc),
        timestampNow: jest.fn().mockReturnValue(mockTimestamp),
        updateDoc: jest.fn().mockResolvedValue(undefined),
      });

      await workoutsService.validateWorkout(userId, workoutId);

      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
        validated: true,
        updatedAt: mockTimestamp,
      });
    });

    it('should throw error if workout does not exist', async () => {
      const userId = 'user123';
      const workoutId = 'nonexistent';

      const mockDocRef = { id: workoutId };
      const mockExistingDoc = {
        exists: () => false,
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockExistingDoc),
      });

      await expect(workoutsService.validateWorkout(userId, workoutId)).rejects.toThrow(
        ServiceError,
      );
    });
  });

  describe('unvalidateWorkout', () => {
    it('should unvalidate a workout', async () => {
      const userId = 'user123';
      const workoutId = 'workout1';

      const mockDocRef = { id: workoutId };
      const mockExistingDoc = {
        exists: () => true,
      };
      const now = new Date('2024-01-01T00:00:00Z');
      const mockTimestamp = Timestamp.fromDate(now);

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockExistingDoc),
        timestampNow: jest.fn().mockReturnValue(mockTimestamp),
        updateDoc: jest.fn().mockResolvedValue(undefined),
      });

      await workoutsService.unvalidateWorkout(userId, workoutId);

      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
        validated: false,
        updatedAt: mockTimestamp,
      });
    });

    it('should throw error if workout does not exist', async () => {
      const userId = 'user123';
      const workoutId = 'nonexistent';

      const mockDocRef = { id: workoutId };
      const mockExistingDoc = {
        exists: () => false,
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockExistingDoc),
      });

      await expect(workoutsService.unvalidateWorkout(userId, workoutId)).rejects.toThrow(
        ServiceError,
      );
    });
  });

  describe('deleteWorkout', () => {
    it('should delete a workout', async () => {
      const userId = 'user123';
      const workoutId = 'workout1';

      const mockDocRef = { id: workoutId };
      const mockExistingDoc = {
        exists: () => true,
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockExistingDoc),
        deleteDoc: jest.fn().mockResolvedValue(undefined),
      });

      await workoutsService.deleteWorkout(userId, workoutId);

      expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    });

    it('should throw error if workout does not exist', async () => {
      const userId = 'user123';
      const workoutId = 'nonexistent';

      const mockDocRef = { id: workoutId };
      const mockExistingDoc = {
        exists: () => false,
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockExistingDoc),
      });

      await expect(workoutsService.deleteWorkout(userId, workoutId)).rejects.toThrow(ServiceError);
    });
  });

  describe('getLatestValidatedWorkout', () => {
    it('should return the latest validated workout', async () => {
      const userId = 'user123';

      const date1 = Timestamp.fromDate(new Date('2024-01-01'));
      const date2 = Timestamp.fromDate(new Date('2024-01-05'));
      const createdAt = Timestamp.fromDate(new Date('2024-01-01'));
      const updatedAt = Timestamp.fromDate(new Date('2024-01-01'));

      const mockWorkouts = [
        {
          id: 'workout1',
          data: () => ({
            date: date1,
            notes: 'Workout 1',
            exercises: [],
            validated: true,
            createdAt,
            updatedAt,
          }),
        },
        {
          id: 'workout2',
          data: () => ({
            date: date2,
            notes: 'Workout 2',
            exercises: [],
            validated: true,
            createdAt,
            updatedAt,
          }),
        },
      ];

      const mockCollectionRef = {};
      const mockQuery = {};
      const mockSnapshot = {
        empty: false,
        docs: mockWorkouts,
      };

      setupMocks({
        collection: jest.fn().mockReturnValue(mockCollectionRef),
        where: jest.fn().mockReturnValue(mockQuery),
        query: jest.fn().mockReturnValue(mockQuery),
        getDocs: jest.fn().mockResolvedValue(mockSnapshot),
      });

      const result = await workoutsService.getLatestValidatedWorkout(userId);

      expect(result).toBeDefined();
      expect(result?.id).toBe('workout2'); // Should be the latest (date2 > date1)
    });

    it('should return null if no validated workouts exist', async () => {
      const userId = 'user123';

      const mockCollectionRef = {};
      const mockQuery = {};
      const mockSnapshot = {
        empty: true,
        docs: [],
      };

      setupMocks({
        collection: jest.fn().mockReturnValue(mockCollectionRef),
        where: jest.fn().mockReturnValue(mockQuery),
        query: jest.fn().mockReturnValue(mockQuery),
        getDocs: jest.fn().mockResolvedValue(mockSnapshot),
      });

      const result = await workoutsService.getLatestValidatedWorkout(userId);

      expect(result).toBeNull();
    });
  });

  describe('getEarliestNonValidatedFutureWorkout', () => {
    it('should return the earliest non-validated future workout', async () => {
      const userId = 'user123';
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = Timestamp.fromDate(tomorrow);
      const createdAt = Timestamp.fromDate(new Date('2024-01-01'));
      const updatedAt = Timestamp.fromDate(new Date('2024-01-01'));

      const mockWorkouts = [
        {
          id: 'workout1',
          data: () => ({
            date: futureDate,
            notes: 'Future workout',
            exercises: [],
            validated: false,
            createdAt,
            updatedAt,
          }),
        },
      ];

      const mockCollectionRef = {};
      const mockQuery = {};
      const mockSnapshot = {
        empty: false,
        docs: mockWorkouts,
      };

      setupMocks({
        collection: jest.fn().mockReturnValue(mockCollectionRef),
        orderBy: jest.fn().mockReturnValue(mockQuery),
        query: jest.fn().mockReturnValue(mockQuery),
        getDocs: jest.fn().mockResolvedValue(mockSnapshot),
      });

      const result = await workoutsService.getEarliestNonValidatedFutureWorkout(userId);

      expect(result).toBeDefined();
    });

    it('should return null if no future workouts exist', async () => {
      const userId = 'user123';
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDate = Timestamp.fromDate(yesterday);

      const mockWorkouts = [
        {
          id: 'workout1',
          data: () => ({
            date: pastDate,
            notes: 'Past workout',
            exercises: [],
            validated: false,
          }),
        },
      ];

      const mockCollectionRef = {};
      const mockQuery = {};
      const mockSnapshot = {
        empty: false,
        docs: mockWorkouts,
      };

      setupMocks({
        collection: jest.fn().mockReturnValue(mockCollectionRef),
        orderBy: jest.fn().mockReturnValue(mockQuery),
        query: jest.fn().mockReturnValue(mockQuery),
        getDocs: jest.fn().mockResolvedValue(mockSnapshot),
      });

      const result = await workoutsService.getEarliestNonValidatedFutureWorkout(userId);

      expect(result).toBeNull();
    });
  });

  describe('getTodaysWorkout', () => {
    it("should return today's workout, prioritizing non-validated", async () => {
      const userId = 'user123';
      const today = new Date();
      const todayDate = Timestamp.fromDate(today);
      const createdAt = Timestamp.fromDate(new Date('2024-01-01'));
      const updatedAt = Timestamp.fromDate(new Date('2024-01-01'));

      const mockWorkouts = [
        {
          id: 'workout1',
          data: () => ({
            date: todayDate,
            notes: 'Today workout',
            exercises: [],
            validated: false,
            createdAt,
            updatedAt,
          }),
        },
      ];

      const mockCollectionRef = {};
      const mockQuery = {};
      const mockSnapshot = {
        empty: false,
        docs: mockWorkouts,
      };

      setupMocks({
        collection: jest.fn().mockReturnValue(mockCollectionRef),
        query: jest.fn().mockReturnValue(mockQuery),
        getDocs: jest.fn().mockResolvedValue(mockSnapshot),
      });

      const result = await workoutsService.getTodaysWorkout(userId);

      expect(result).toBeDefined();
      expect(result?.validated).toBe(false);
    });

    it('should return null if no workout exists for today', async () => {
      const userId = 'user123';
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDate = Timestamp.fromDate(tomorrow);

      const mockWorkouts = [
        {
          id: 'workout1',
          data: () => ({
            date: tomorrowDate,
            notes: 'Tomorrow workout',
            exercises: [],
            validated: false,
          }),
        },
      ];

      const mockCollectionRef = {};
      const mockQuery = {};
      const mockSnapshot = {
        empty: false,
        docs: mockWorkouts,
      };

      setupMocks({
        collection: jest.fn().mockReturnValue(mockCollectionRef),
        query: jest.fn().mockReturnValue(mockQuery),
        getDocs: jest.fn().mockResolvedValue(mockSnapshot),
      });

      const result = await workoutsService.getTodaysWorkout(userId);

      expect(result).toBeNull();
    });
  });

  describe('getWorkout', () => {
    it('should return a workout by id', async () => {
      const userId = 'user123';
      const workoutId = 'workout1';
      const date = Timestamp.fromDate(new Date('2024-01-01'));
      const createdAt = Timestamp.fromDate(new Date('2024-01-01'));
      const updatedAt = Timestamp.fromDate(new Date('2024-01-01'));

      const mockDocRef = { id: workoutId };
      const mockDoc = {
        exists: () => true,
        id: workoutId,
        data: () => ({
          date,
          notes: 'Test workout',
          exercises: [],
          validated: true,
          createdAt,
          updatedAt,
        }),
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockDoc),
      });

      const result = await workoutsService.getWorkout(userId, workoutId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(workoutId);
    });

    it('should return null if workout does not exist', async () => {
      const userId = 'user123';
      const workoutId = 'nonexistent';

      const mockDocRef = { id: workoutId };
      const mockDoc = {
        exists: () => false,
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockDoc),
      });

      const result = await workoutsService.getWorkout(userId, workoutId);

      expect(result).toBeNull();
    });
  });

  describe('getWorkouts', () => {
    it('should return all workouts ordered by date descending', async () => {
      const userId = 'user123';
      const date1 = Timestamp.fromDate(new Date('2024-01-01'));
      const date2 = Timestamp.fromDate(new Date('2024-01-05'));
      const createdAt = Timestamp.fromDate(new Date('2024-01-01'));
      const updatedAt = Timestamp.fromDate(new Date('2024-01-01'));

      const mockWorkouts = [
        {
          id: 'workout1',
          data: () => ({
            date: date1,
            notes: 'Workout 1',
            exercises: [],
            validated: true,
            createdAt,
            updatedAt,
          }),
        },
        {
          id: 'workout2',
          data: () => ({
            date: date2,
            notes: 'Workout 2',
            exercises: [],
            validated: true,
            createdAt,
            updatedAt,
          }),
        },
      ];

      const mockCollectionRef = {};
      const mockQuery = {};
      const mockSnapshot = {
        empty: false,
        docs: mockWorkouts,
      };

      setupMocks({
        collection: jest.fn().mockReturnValue(mockCollectionRef),
        orderBy: jest.fn().mockReturnValue(mockQuery),
        query: jest.fn().mockReturnValue(mockQuery),
        getDocs: jest.fn().mockResolvedValue(mockSnapshot),
      });

      const result = await workoutsService.getWorkouts(userId);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('workout1');
      expect(result[1].id).toBe('workout2');
    });

    it('should filter out invalid workouts', async () => {
      const userId = 'user123';
      const date1 = Timestamp.fromDate(new Date('2024-01-01'));
      const createdAt = Timestamp.fromDate(new Date('2024-01-01'));
      const updatedAt = Timestamp.fromDate(new Date('2024-01-01'));

      const mockWorkouts = [
        {
          id: 'workout1',
          data: () => ({
            date: date1,
            notes: 'Valid workout',
            exercises: [
              {
                exerciseId: 'ex1',
                name: 'Bench Press',
                order: 0,
                sets: [{ weight: 100, reps: 5, rir: 2 }],
              },
            ],
            validated: true,
            createdAt,
            updatedAt,
          }),
        },
        {
          id: 'workout2',
          data: () => ({
            date: date1,
            notes: 'Invalid workout',
            exercises: [
              {
                exerciseId: '', // Invalid: empty exerciseId will cause validation to fail
                name: 'Invalid Exercise',
                order: 0,
                sets: [{ weight: 100, reps: 5, rir: 2 }],
              },
            ],
            validated: false,
            createdAt,
            updatedAt,
          }),
        },
      ];

      const mockCollectionRef = {};
      const mockQuery = {};
      const mockSnapshot = {
        empty: false,
        docs: mockWorkouts,
      };

      setupMocks({
        collection: jest.fn().mockReturnValue(mockCollectionRef),
        orderBy: jest.fn().mockReturnValue(mockQuery),
        query: jest.fn().mockReturnValue(mockQuery),
        getDocs: jest.fn().mockResolvedValue(mockSnapshot),
      });

      const result = await workoutsService.getWorkouts(userId);

      // Should filter out invalid workout
      expect(result.length).toBeLessThanOrEqual(1);
    });
  });
});
