import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { ExercisesService } from './exercises';
import { ServiceError } from '@/utils/serviceErrors';

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  writeBatch: jest.fn(),
}));

type MockOverrides = {
  collection?: jest.Mock;
  doc?: jest.Mock;
  getDoc?: jest.Mock;
  getDocs?: jest.Mock;
  setDoc?: jest.Mock;
  writeBatch?: jest.Mock;
};

const setupMocks = (overrides: Partial<MockOverrides> = {}) => {
  const defaults = {
    collection: jest.fn().mockReturnValue({}),
    doc: jest.fn().mockReturnValue({ id: 'mock-doc-id' }),
    getDoc: jest.fn().mockResolvedValue({
      exists: () => false,
      data: () => ({}),
    }),
    getDocs: jest.fn().mockResolvedValue({
      empty: true,
      docs: [],
    }),
    setDoc: jest.fn().mockResolvedValue(undefined),
    writeBatch: jest.fn().mockReturnValue({
      set: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    }),
  };

  const mocks = { ...defaults, ...overrides };

  // Apply mocks
  (collection as jest.Mock).mockImplementation(mocks.collection);
  (doc as jest.Mock).mockImplementation(mocks.doc);
  (getDoc as jest.Mock).mockImplementation(mocks.getDoc);
  (getDocs as jest.Mock).mockImplementation(mocks.getDocs);
  (setDoc as jest.Mock).mockImplementation(mocks.setDoc);
  (writeBatch as jest.Mock).mockImplementation(mocks.writeBatch);

  return mocks;
};

describe('ExercisesService', () => {
  let exercisesService: ExercisesService;
  let mockDb: Firestore;

  beforeEach(() => {
    mockDb = {} as Firestore;
    exercisesService = new ExercisesService(mockDb);
    jest.clearAllMocks();
  });

  describe('getUserExercises', () => {
    it('should return user exercises when they exist', async () => {
      const userId = 'user123';
      const language = 'en' as const;

      const mockExercises = [
        {
          id: 'exercise1',
          data: () => ({
            name: 'Bench Press',
            category: 'Barbell',
            bodyPart: 'Chest',
            description: 'Chest exercise',
          }),
        },
        {
          id: 'exercise2',
          data: () => ({
            name: 'Squat',
            category: 'Barbell',
            bodyPart: 'Legs',
          }),
        },
      ];

      const mockCollectionRef = {};
      const mockSnapshot = {
        empty: false,
        docs: mockExercises,
      };

      setupMocks({
        collection: jest.fn().mockReturnValue(mockCollectionRef),
        getDocs: jest.fn().mockResolvedValue(mockSnapshot),
      });

      const result = await exercisesService.getUserExercises(userId, language);

      expect(collection).toHaveBeenCalledWith(mockDb, `users/${userId}/exercises`);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'exercise1',
        name: 'Bench Press',
        category: 'Barbell',
        bodyPart: 'Chest',
        description: 'Chest exercise',
        isCustom: false,
      });
    });

    it('should copy library exercises to user collection when user exercises do not exist', async () => {
      const userId = 'user123';
      const language = 'en' as const;

      const mockLibraryExercises = [
        {
          id: 'lib-exercise1',
          data: () => ({
            name: 'Library Exercise 1',
            category: 'Barbell',
            bodyPart: 'Chest',
            description: 'Library exercise',
          }),
        },
      ];

      const mockUserCollectionRef = {};
      const mockLibraryCollectionRef = {};
      const mockUserSnapshot = { empty: true, docs: [] };
      const mockLibrarySnapshot = {
        empty: false,
        docs: mockLibraryExercises,
      };

      const mockBatch = {
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
      };

      setupMocks({
        collection: jest
          .fn()
          .mockReturnValueOnce(mockUserCollectionRef)
          .mockReturnValueOnce(mockLibraryCollectionRef),
        getDocs: jest
          .fn()
          .mockResolvedValueOnce(mockUserSnapshot)
          .mockResolvedValueOnce(mockLibrarySnapshot),
        doc: jest.fn().mockReturnValue({}),
        writeBatch: jest.fn().mockReturnValue(mockBatch),
      });

      const result = await exercisesService.getUserExercises(userId, language);

      expect(collection).toHaveBeenCalledWith(mockDb, `users/${userId}/exercises`);
      expect(collection).toHaveBeenCalledWith(mockDb, 'exercisesLibrary');
      expect(writeBatch).toHaveBeenCalledWith(mockDb);
      expect(mockBatch.set).toHaveBeenCalled();
      expect(mockBatch.commit).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].isCustom).toBe(false);
    });

    it('should handle different languages', async () => {
      const userId = 'user123';

      const mockUserCollectionRef = {};
      const mockUserSnapshot = { empty: true, docs: [] };
      const mockLibrarySnapshot = { empty: true, docs: [] };
      const mockBatch = {
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
      };

      setupMocks({
        collection: jest.fn().mockReturnValue(mockUserCollectionRef),
        getDocs: jest
          .fn()
          .mockResolvedValueOnce(mockUserSnapshot)
          .mockResolvedValueOnce(mockLibrarySnapshot),
        writeBatch: jest.fn().mockReturnValue(mockBatch),
      });

      await exercisesService.getUserExercises(userId, 'es');
      expect(collection).toHaveBeenCalledWith(mockDb, `users/${userId}/exercisesEs`);

      setupMocks({
        collection: jest.fn().mockReturnValue(mockUserCollectionRef),
        getDocs: jest
          .fn()
          .mockResolvedValueOnce(mockUserSnapshot)
          .mockResolvedValueOnce(mockLibrarySnapshot),
        writeBatch: jest.fn().mockReturnValue(mockBatch),
      });

      await exercisesService.getUserExercises(userId, 'fr');
      expect(collection).toHaveBeenCalledWith(mockDb, `users/${userId}/exercisesFr`);
    });

    it('should throw error for invalid exercise data', async () => {
      const userId = 'user123';
      const language = 'en' as const;

      const mockExercises = [
        {
          id: 'exercise1',
          data: () => ({
            name: '', // Invalid: empty name
            category: 'Barbell',
            bodyPart: 'Chest',
          }),
        },
      ];

      const mockCollectionRef = {};
      const mockSnapshot = {
        empty: false,
        docs: mockExercises,
      };

      setupMocks({
        collection: jest.fn().mockReturnValue(mockCollectionRef),
        getDocs: jest.fn().mockResolvedValue(mockSnapshot),
      });

      await expect(exercisesService.getUserExercises(userId, language)).rejects.toThrow(
        ServiceError,
      );
    });
  });

  describe('createExercise', () => {
    it('should create a new exercise', async () => {
      const userId = 'user123';
      const language = 'en' as const;
      const exercise = {
        name: 'New Exercise',
        category: 'Dumbbell',
        bodyPart: 'Shoulders',
        description: 'A new exercise',
        allowedUnits: ['load', 'reps'],
      };

      const mockDocRef = { id: 'new-exercise' };
      const mockExistingDoc = {
        exists: () => false,
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockExistingDoc),
        setDoc: jest.fn().mockResolvedValue(undefined),
      });

      const result = await exercisesService.createExercise(userId, language, exercise);

      expect(result).toBe('new-exercise');
      expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
        name: 'New Exercise',
        category: 'Dumbbell',
        bodyPart: 'Shoulders',
        description: 'A new exercise',
        isCustom: true,
      });
    });

    it('should generate ID from exercise name', async () => {
      const userId = 'user123';
      const language = 'en' as const;
      const exercise = {
        name: 'My Custom Exercise',
        category: 'Barbell',
        bodyPart: 'Back',
        allowedUnits: ['load', 'reps'],
      };

      const mockDocRef = { id: 'my-custom-exercise' };
      const mockExistingDoc = {
        exists: () => false,
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockExistingDoc),
        setDoc: jest.fn().mockResolvedValue(undefined),
      });

      const result = await exercisesService.createExercise(userId, language, exercise);

      expect(result).toBe('my-custom-exercise');
    });

    it('should throw error if exercise already exists', async () => {
      const userId = 'user123';
      const language = 'en' as const;
      const exercise = {
        name: 'Existing Exercise',
        category: 'Barbell',
        bodyPart: 'Chest',
        allowedUnits: ['load', 'reps'],
      };

      const mockDocRef = { id: 'existing-exercise' };
      const mockExistingDoc = {
        exists: () => true,
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockExistingDoc),
      });

      await expect(exercisesService.createExercise(userId, language, exercise)).rejects.toThrow(
        ServiceError,
      );
      expect(setDoc).not.toHaveBeenCalled();
    });

    it('should trim whitespace from exercise data', async () => {
      const userId = 'user123';
      const language = 'en' as const;
      const exercise = {
        name: '  Trimmed Exercise  ',
        category: '  Barbell  ',
        bodyPart: '  Chest  ',
        description: '  Description  ',
        allowedUnits: ['load', 'reps'],
      };

      const mockDocRef = { id: 'trimmed-exercise' };
      const mockExistingDoc = {
        exists: () => false,
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockExistingDoc),
        setDoc: jest.fn().mockResolvedValue(undefined),
      });

      await exercisesService.createExercise(userId, language, exercise);

      expect(setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          name: 'Trimmed Exercise',
          category: 'Barbell',
          bodyPart: 'Chest',
          description: 'Description',
        }),
      );
    });
  });

  describe('updateExercise', () => {
    it('should update existing exercise', async () => {
      const userId = 'user123';
      const exerciseId = 'exercise1';
      const language = 'en' as const;
      const updateData = {
        name: 'Updated Exercise',
        category: 'Dumbbell',
        bodyPart: 'Shoulders',
        description: 'Updated description',
        allowedUnits: ['load', 'reps'],
      };

      const mockDocRef = { id: exerciseId };
      const mockExistingDoc = {
        exists: () => true,
        data: () => ({
          isCustom: true,
        }),
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockExistingDoc),
        setDoc: jest.fn().mockResolvedValue(undefined),
      });

      await exercisesService.updateExercise(userId, language, exerciseId, updateData);

      expect(setDoc).toHaveBeenCalledWith(
        mockDocRef,
        {
          name: 'Updated Exercise',
          category: 'Dumbbell',
          bodyPart: 'Shoulders',
          description: 'Updated description',
          isCustom: true,
        },
        { merge: false },
      );
    });

    it('should preserve isCustom flag', async () => {
      const userId = 'user123';
      const exerciseId = 'exercise1';
      const language = 'en' as const;
      const updateData = {
        name: 'Updated Exercise',
        category: 'Barbell',
        bodyPart: 'Chest',
        allowedUnits: ['load', 'reps'],
      };

      const mockDocRef = { id: exerciseId };
      const mockExistingDoc = {
        exists: () => true,
        data: () => ({
          isCustom: false,
        }),
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockExistingDoc),
        setDoc: jest.fn().mockResolvedValue(undefined),
      });

      await exercisesService.updateExercise(userId, language, exerciseId, updateData);

      expect(setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          isCustom: false,
        }),
        { merge: false },
      );
    });

    it('should throw error if exercise does not exist', async () => {
      const userId = 'user123';
      const exerciseId = 'nonexistent';
      const language = 'en' as const;
      const updateData = {
        name: 'Updated Exercise',
        category: 'Barbell',
        bodyPart: 'Chest',
        allowedUnits: ['load', 'reps'],
      };

      const mockDocRef = { id: exerciseId };
      const mockExistingDoc = {
        exists: () => false,
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockExistingDoc),
      });

      await expect(
        exercisesService.updateExercise(userId, language, exerciseId, updateData),
      ).rejects.toThrow(ServiceError);
      expect(setDoc).not.toHaveBeenCalled();
    });
  });

  describe('getExercise', () => {
    it('should return exercise when it exists', async () => {
      const userId = 'user123';
      const exerciseId = 'exercise1';
      const language = 'en' as const;

      const mockDocRef = { id: exerciseId };
      const mockDoc = {
        exists: () => true,
        id: exerciseId,
        data: () => ({
          name: 'Bench Press',
          category: 'Barbell',
          bodyPart: 'Chest',
          description: 'Chest exercise',
        }),
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockDoc),
      });

      const result = await exercisesService.getExercise(userId, exerciseId, language);

      expect(result).toEqual({
        id: exerciseId,
        name: 'Bench Press',
        category: 'Barbell',
        bodyPart: 'Chest',
        description: 'Chest exercise',
        isCustom: false,
      });
    });

    it('should throw error if exercise does not exist', async () => {
      const userId = 'user123';
      const exerciseId = 'nonexistent';
      const language = 'en' as const;

      const mockDocRef = { id: exerciseId };
      const mockDoc = {
        exists: () => false,
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockDoc),
      });

      await expect(exercisesService.getExercise(userId, exerciseId, language)).rejects.toThrow(
        ServiceError,
      );
    });

    it('should throw error for invalid exercise data', async () => {
      const userId = 'user123';
      const exerciseId = 'exercise1';
      const language = 'en' as const;

      const mockDocRef = { id: exerciseId };
      const mockDoc = {
        exists: () => true,
        id: exerciseId,
        data: () => ({
          name: '', // Invalid: empty name
          category: 'Barbell',
          bodyPart: 'Chest',
        }),
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockDoc),
      });

      await expect(exercisesService.getExercise(userId, exerciseId, language)).rejects.toThrow(
        ServiceError,
      );
    });
  });
});
