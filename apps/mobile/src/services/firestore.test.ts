// Mock firebase/firestore first to prevent ESM parsing issues
jest.mock('firebase/firestore', () => ({
  Firestore: jest.fn(),
}));

// Mock the individual services
jest.mock('./user-profile');
jest.mock('./exercises');
jest.mock('./workouts');
jest.mock('./programs');

/* eslint-disable import/first */
import { Firestore } from 'firebase/firestore';
import { FirestoreService } from './firestore';
import { UserProfileService } from './user-profile';
import { ExercisesService } from './exercises';
import { WorkoutsService } from './workouts';
import { ProgramsService } from './programs';
import type { UserProfile, WorkoutInput, ProgramInput } from '@/domain';
import { SupportedLanguage } from '@/locale/i18n';
/* eslint-enable import/first */

describe('FirestoreService', () => {
  let firestoreService: FirestoreService;
  let mockDb: Firestore;
  let mockUserProfileService: jest.Mocked<UserProfileService>;
  let mockExercisesService: jest.Mocked<ExercisesService>;
  let mockWorkoutsService: jest.Mocked<WorkoutsService>;
  let mockProgramsService: jest.Mocked<ProgramsService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = {} as Firestore;

    // Setup mocks before creating service
    const mockUserProfileInstance = {
      createUserProfile: jest.fn(),
      getUserProfile: jest.fn(),
      updateUserProfile: jest.fn(),
    } as unknown as jest.Mocked<UserProfileService>;

    const mockExercisesInstance = {
      getUserExercises: jest.fn(),
      createExercise: jest.fn(),
      updateExercise: jest.fn(),
      getExercise: jest.fn(),
    } as unknown as jest.Mocked<ExercisesService>;

    const mockWorkoutsInstance = {
      createWorkout: jest.fn(),
      updateWorkout: jest.fn(),
      validateWorkout: jest.fn(),
      unvalidateWorkout: jest.fn(),
      deleteWorkout: jest.fn(),
      getLatestValidatedWorkout: jest.fn(),
      getEarliestNonValidatedFutureWorkout: jest.fn(),
      getTodaysWorkout: jest.fn(),
      getWorkout: jest.fn(),
      getWorkouts: jest.fn(),
    } as unknown as jest.Mocked<WorkoutsService>;

    const mockProgramsInstance = {
      createProgram: jest.fn(),
      getPrograms: jest.fn(),
      getProgram: jest.fn(),
      deleteProgram: jest.fn(),
    } as unknown as jest.Mocked<ProgramsService>;

    (UserProfileService as jest.MockedClass<typeof UserProfileService>).mockImplementation(
      () => mockUserProfileInstance,
    );
    (ExercisesService as jest.MockedClass<typeof ExercisesService>).mockImplementation(
      () => mockExercisesInstance,
    );
    (WorkoutsService as jest.MockedClass<typeof WorkoutsService>).mockImplementation(
      () => mockWorkoutsInstance,
    );
    (ProgramsService as jest.MockedClass<typeof ProgramsService>).mockImplementation(
      () => mockProgramsInstance,
    );

    firestoreService = new FirestoreService(mockDb);

    // Store references to the mocked instances
    mockUserProfileService = mockUserProfileInstance;
    mockExercisesService = mockExercisesInstance;
    mockWorkoutsService = mockWorkoutsInstance;
    mockProgramsService = mockProgramsInstance;
  });

  describe('User Profile delegation', () => {
    it('should delegate createUserProfile to UserProfileService', async () => {
      const uid = 'user123';
      const data = {
        email: 'test@example.com',
        displayName: 'Test User',
        preferences: {
          weightUnit: 'kg' as const,
          distanceUnit: 'cm' as const,
          temperatureUnit: 'celsius' as const,
        },
      };

      mockUserProfileService.createUserProfile.mockResolvedValue(undefined);

      await firestoreService.createUserProfile(uid, data);

      expect(mockUserProfileService.createUserProfile).toHaveBeenCalledWith(uid, data);
    });

    it('should delegate getUserProfile to UserProfileService', async () => {
      const uid = 'user123';
      const mockProfile = {
        uid,
        email: 'test@example.com',
        displayName: 'Test User',
        preferences: {
          weightUnit: 'kg' as const,
          distanceUnit: 'cm' as const,
          temperatureUnit: 'celsius' as const,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as UserProfile;

      mockUserProfileService.getUserProfile.mockResolvedValue(mockProfile);

      const result = await firestoreService.getUserProfile(uid);

      expect(mockUserProfileService.getUserProfile).toHaveBeenCalledWith(uid);
      expect(result).toBe(mockProfile);
    });

    it('should delegate updateUserProfile to UserProfileService', async () => {
      const uid = 'user123';
      const data = {
        displayName: 'Updated Name',
      };

      mockUserProfileService.updateUserProfile.mockResolvedValue(undefined);

      await firestoreService.updateUserProfile(uid, data);

      expect(mockUserProfileService.updateUserProfile).toHaveBeenCalledWith(uid, data);
    });
  });

  describe('Exercise delegation', () => {
    it('should delegate getUserExercises to ExercisesService', async () => {
      const userId = 'user123';
      const language = 'en' as SupportedLanguage;
      const mockExercises = [
        {
          id: 'ex1',
          name: 'Bench Press',
          category: 'Barbell',
          bodyPart: 'Chest',
        },
      ];

      mockExercisesService.getUserExercises.mockResolvedValue(mockExercises as any);

      const result = await firestoreService.getUserExercises(userId, language);

      expect(mockExercisesService.getUserExercises).toHaveBeenCalledWith(userId, language);
      expect(result).toBe(mockExercises);
    });

    it('should delegate createExercise to ExercisesService', async () => {
      const userId = 'user123';
      const language = 'en' as SupportedLanguage;
      const exercise = {
        name: 'New Exercise',
        category: 'Barbell',
        bodyPart: 'Chest',
        allowedUnits: ['reps', 'weight'],
      };

      mockExercisesService.createExercise.mockResolvedValue('exercise-id');

      const result = await firestoreService.createExercise(userId, language, exercise);

      expect(mockExercisesService.createExercise).toHaveBeenCalledWith(userId, language, exercise);
      expect(result).toBe('exercise-id');
    });

    it('should delegate updateExercise to ExercisesService', async () => {
      const userId = 'user123';
      const exerciseId = 'ex1';
      const language = 'en' as SupportedLanguage;
      const exercise = {
        name: 'Updated Exercise',
        category: 'Barbell',
        bodyPart: 'Chest',
        allowedUnits: ['reps', 'weight'],
      };

      mockExercisesService.updateExercise.mockResolvedValue(undefined);

      await firestoreService.updateExercise(userId, exerciseId, language, exercise);

      expect(mockExercisesService.updateExercise).toHaveBeenCalledWith(
        userId,
        language,
        exerciseId,
        exercise,
      );
    });

    it('should delegate getExercise to ExercisesService', async () => {
      const userId = 'user123';
      const exerciseId = 'ex1';
      const language = 'en' as SupportedLanguage;
      const mockExercise = {
        id: exerciseId,
        name: 'Bench Press',
        category: 'Barbell',
        bodyPart: 'Chest',
      };

      mockExercisesService.getExercise.mockResolvedValue(mockExercise as any);

      const result = await firestoreService.getExercise(userId, exerciseId, language);

      expect(mockExercisesService.getExercise).toHaveBeenCalledWith(userId, exerciseId, language);
      expect(result).toBe(mockExercise);
    });
  });

  describe('Workout delegation', () => {
    it('should delegate createWorkout to WorkoutsService', async () => {
      const userId = 'user123';
      const workout = {
        date: new Date(),
        exercises: [
          {
            exerciseId: 'ex1',
            name: 'Bench Press',
            order: 0,
            sets: [{ weight: 100, reps: 5, rir: 2 }],
          },
        ],
      } as WorkoutInput;

      mockWorkoutsService.createWorkout.mockResolvedValue('workout-id');

      const result = await firestoreService.createWorkout(userId, workout);

      expect(mockWorkoutsService.createWorkout).toHaveBeenCalledWith(userId, workout);
      expect(result).toBe('workout-id');
    });

    it('should delegate updateWorkout to WorkoutsService', async () => {
      const userId = 'user123';
      const workoutId = 'workout1';
      const workout = {
        date: new Date(),
        exercises: [],
      } as WorkoutInput;

      mockWorkoutsService.updateWorkout.mockResolvedValue(undefined);

      await firestoreService.updateWorkout(userId, workoutId, workout);

      expect(mockWorkoutsService.updateWorkout).toHaveBeenCalledWith(userId, workoutId, workout);
    });

    it('should delegate validateWorkout to WorkoutsService', async () => {
      const userId = 'user123';
      const workoutId = 'workout1';

      mockWorkoutsService.validateWorkout.mockResolvedValue(undefined);

      await firestoreService.validateWorkout(userId, workoutId);

      expect(mockWorkoutsService.validateWorkout).toHaveBeenCalledWith(userId, workoutId);
    });

    it('should delegate unvalidateWorkout to WorkoutsService', async () => {
      const userId = 'user123';
      const workoutId = 'workout1';

      mockWorkoutsService.unvalidateWorkout.mockResolvedValue(undefined);

      await firestoreService.unvalidateWorkout(userId, workoutId);

      expect(mockWorkoutsService.unvalidateWorkout).toHaveBeenCalledWith(userId, workoutId);
    });

    it('should delegate deleteWorkout to WorkoutsService', async () => {
      const userId = 'user123';
      const workoutId = 'workout1';

      mockWorkoutsService.deleteWorkout.mockResolvedValue(undefined);

      await firestoreService.deleteWorkout(userId, workoutId);

      expect(mockWorkoutsService.deleteWorkout).toHaveBeenCalledWith(userId, workoutId);
    });

    it('should delegate getLatestValidatedWorkout to WorkoutsService', async () => {
      const userId = 'user123';
      const mockWorkout = {
        id: 'workout1',
        date: new Date(),
        exercises: [],
        validated: true,
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockWorkoutsService.getLatestValidatedWorkout.mockResolvedValue(mockWorkout as any);

      const result = await firestoreService.getLatestValidatedWorkout(userId);

      expect(mockWorkoutsService.getLatestValidatedWorkout).toHaveBeenCalledWith(userId);
      expect(result).toBe(mockWorkout);
    });

    it('should delegate getEarliestNonValidatedFutureWorkout to WorkoutsService', async () => {
      const userId = 'user123';
      const mockWorkout = {
        id: 'workout1',
        date: new Date(),
        exercises: [],
        validated: false,
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockWorkoutsService.getEarliestNonValidatedFutureWorkout.mockResolvedValue(
        mockWorkout as any,
      );

      const result = await firestoreService.getEarliestNonValidatedFutureWorkout(userId);

      expect(mockWorkoutsService.getEarliestNonValidatedFutureWorkout).toHaveBeenCalledWith(userId);
      expect(result).toBe(mockWorkout);
    });

    it('should delegate getTodaysWorkout to WorkoutsService', async () => {
      const userId = 'user123';
      const mockWorkout = {
        id: 'workout1',
        date: new Date(),
        exercises: [],
        validated: false,
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockWorkoutsService.getTodaysWorkout.mockResolvedValue(mockWorkout as any);

      const result = await firestoreService.getTodaysWorkout(userId);

      expect(mockWorkoutsService.getTodaysWorkout).toHaveBeenCalledWith(userId);
      expect(result).toBe(mockWorkout);
    });

    it('should delegate getWorkout to WorkoutsService', async () => {
      const userId = 'user123';
      const workoutId = 'workout1';
      const mockWorkout = {
        id: workoutId,
        date: new Date(),
        exercises: [],
        validated: true,
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockWorkoutsService.getWorkout.mockResolvedValue(mockWorkout as any);

      const result = await firestoreService.getWorkout(userId, workoutId);

      expect(mockWorkoutsService.getWorkout).toHaveBeenCalledWith(userId, workoutId);
      expect(result).toBe(mockWorkout);
    });

    it('should delegate getWorkouts to WorkoutsService', async () => {
      const userId = 'user123';
      const mockWorkouts = [
        {
          id: 'workout1',
          date: new Date(),
          exercises: [],
          validated: true,
          notes: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockWorkoutsService.getWorkouts.mockResolvedValue(mockWorkouts as any);

      const result = await firestoreService.getWorkouts(userId);

      expect(mockWorkoutsService.getWorkouts).toHaveBeenCalledWith(userId);
      expect(result).toBe(mockWorkouts);
    });
  });

  describe('Program delegation', () => {
    it('should delegate createProgram to ProgramsService', async () => {
      const userId = 'user123';
      const program = {
        name: 'Test Program',
        description: 'A test program',
        type: 'simple' as const,
        week: {
          days: [
            {
              label: 'Day1' as const,
              name: 'Push Day',
              exercises: [
                {
                  id: 'ex1',
                  name: 'Bench Press',
                  sets: [{ reps: 5, rir: 2 }],
                },
              ],
            },
          ],
        },
      } as ProgramInput;

      mockProgramsService.createProgram.mockResolvedValue('program-id');

      const result = await firestoreService.createProgram(userId, program);

      expect(mockProgramsService.createProgram).toHaveBeenCalledWith(userId, program);
      expect(result).toBe('program-id');
    });

    it('should delegate getPrograms to ProgramsService', async () => {
      const userId = 'user123';
      const mockPrograms = [
        {
          id: 'program1',
          name: 'Test Program',
          description: 'A test program',
          type: 'simple' as const,
          week: {
            days: [],
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockProgramsService.getPrograms.mockResolvedValue(mockPrograms as any);

      const result = await firestoreService.getPrograms(userId);

      expect(mockProgramsService.getPrograms).toHaveBeenCalledWith(userId);
      expect(result).toBe(mockPrograms);
    });

    it('should delegate getProgram to ProgramsService', async () => {
      const userId = 'user123';
      const programId = 'program1';
      const mockProgram = {
        id: programId,
        name: 'Test Program',
        description: 'A test program',
        type: 'simple' as const,
        week: {
          days: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProgramsService.getProgram.mockResolvedValue(mockProgram as any);

      const result = await firestoreService.getProgram(userId, programId);

      expect(mockProgramsService.getProgram).toHaveBeenCalledWith(userId, programId);
      expect(result).toBe(mockProgram);
    });

    it('should delegate deleteProgram to ProgramsService', async () => {
      const userId = 'user123';
      const programId = 'program1';

      mockProgramsService.deleteProgram.mockResolvedValue(undefined);

      await firestoreService.deleteProgram(userId, programId);

      expect(mockProgramsService.deleteProgram).toHaveBeenCalledWith(userId, programId);
    });
  });
});
