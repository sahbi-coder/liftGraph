import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWorkoutMutations } from './useWorkoutMutations';
import { useDependencies } from '@/dependencies/provider';
import { useAuthenticatedUser } from '@/contexts/AuthContext';
import type { WorkoutInput } from '@/services';

// Mock dependencies
jest.mock('@/dependencies/provider', () => ({
  useDependencies: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuthenticatedUser: jest.fn(),
}));

const mockUseDependencies = useDependencies as jest.MockedFunction<typeof useDependencies>;
const mockUseAuthenticatedUser = useAuthenticatedUser as jest.MockedFunction<
  typeof useAuthenticatedUser
>;

describe('useWorkoutMutations', () => {
  let queryClient: QueryClient;
  let mockFirestoreService: any;
  let mockUser: any;

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false, gcTime: 0 },
      },
    });

    mockUser = {
      uid: 'user123',
      email: 'test@example.com',
    };

    mockFirestoreService = {
      updateWorkout: jest.fn(),
      validateWorkout: jest.fn(),
      unvalidateWorkout: jest.fn(),
      deleteWorkout: jest.fn(),
    };

    mockUseDependencies.mockReturnValue({
      services: {
        firestore: mockFirestoreService,
      },
    } as any);

    mockUseAuthenticatedUser.mockReturnValue({
      user: mockUser,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
    });
  });

  afterEach(async () => {
    // Cancel any pending queries
    queryClient.cancelQueries();
    // Clear all caches
    queryClient.getMutationCache().clear();
    queryClient.getQueryCache().clear();
    queryClient.clear();
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Final cleanup to ensure Jest exits
    if (queryClient) {
      queryClient.getMutationCache().clear();
      queryClient.getQueryCache().clear();
      queryClient.clear();
    }
  });

  describe('updateWorkout', () => {
    it('should call updateWorkout mutation successfully', async () => {
      const workoutId = 'workout123';
      const workoutInput: WorkoutInput = {
        date: new Date('2024-06-15'),
        exercises: [],
        notes: 'Test workout',
      };

      mockFirestoreService.updateWorkout.mockResolvedValue(undefined);

      const { result } = renderHook(() => useWorkoutMutations(workoutId), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.updateWorkout(workoutInput);
      });

      expect(mockFirestoreService.updateWorkout).toHaveBeenCalledWith(
        'user123',
        workoutId,
        workoutInput,
      );
    });

    it('should throw error when user or workoutId is missing', async () => {
      mockUseAuthenticatedUser.mockImplementation(() => {
        throw new Error('User or workout ID is missing');
      });

      expect(() => {
        renderHook(() => useWorkoutMutations('workout123'), {
          wrapper: createWrapper(),
        });
      }).toThrow('User or workout ID is missing');
    });

    it('should invalidate queries on success', async () => {
      const workoutId = 'workout123';
      const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

      mockFirestoreService.updateWorkout.mockResolvedValue(undefined);

      const { result } = renderHook(() => useWorkoutMutations(workoutId), {
        wrapper: createWrapper(),
      });

      const workoutInput: WorkoutInput = {
        date: new Date('2024-06-15'),
        exercises: [],
      };

      await act(async () => {
        await result.current.updateWorkout(workoutInput);
      });

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: ['workout', 'user123', workoutId],
        });
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: ['workouts', 'user123'],
        });
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: ['latestValidatedWorkout', 'user123'],
        });
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: ['earliestFutureWorkout', 'user123'],
        });
      });
    });

    it('should track pending state', async () => {
      const workoutId = 'workout123';
      let resolveUpdate: () => void;
      const updatePromise = new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      });

      mockFirestoreService.updateWorkout.mockReturnValue(updatePromise);

      const { result } = renderHook(() => useWorkoutMutations(workoutId), {
        wrapper: createWrapper(),
      });

      const workoutInput: WorkoutInput = {
        date: new Date('2024-06-15'),
        exercises: [],
      };

      act(() => {
        result.current.updateWorkout(workoutInput);
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(true);
      });

      await act(async () => {
        resolveUpdate!();
        await updatePromise;
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });
    });
  });

  describe('validateWorkout', () => {
    it('should call validateWorkout mutation successfully', async () => {
      const workoutId = 'workout123';
      mockFirestoreService.validateWorkout.mockResolvedValue(undefined);

      const { result } = renderHook(() => useWorkoutMutations(workoutId), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.validateWorkout();
      });

      expect(mockFirestoreService.validateWorkout).toHaveBeenCalledWith('user123', workoutId);
    });

    it('should throw error when user or workoutId is missing', async () => {
      mockUseAuthenticatedUser.mockImplementation(() => {
        throw new Error('User or workout ID is missing');
      });

      expect(() => {
        renderHook(() => useWorkoutMutations('workout123'), {
          wrapper: createWrapper(),
        });
      }).toThrow('User or workout ID is missing');
    });

    it('should invalidate queries on success', async () => {
      const workoutId = 'workout123';
      const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

      mockFirestoreService.validateWorkout.mockResolvedValue(undefined);

      const { result } = renderHook(() => useWorkoutMutations(workoutId), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.validateWorkout();
      });

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledTimes(4);
      });
    });

    it('should track pending state', async () => {
      const workoutId = 'workout123';
      let resolveValidate: () => void;
      const validatePromise = new Promise<void>((resolve) => {
        resolveValidate = resolve;
      });

      mockFirestoreService.validateWorkout.mockReturnValue(validatePromise);

      const { result } = renderHook(() => useWorkoutMutations(workoutId), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.validateWorkout();
      });

      await waitFor(() => {
        expect(result.current.isValidating).toBe(true);
      });

      await act(async () => {
        resolveValidate!();
        await validatePromise;
      });

      await waitFor(() => {
        expect(result.current.isValidating).toBe(false);
      });
    });
  });

  describe('unvalidateWorkout', () => {
    it('should call unvalidateWorkout mutation successfully', async () => {
      const workoutId = 'workout123';
      mockFirestoreService.unvalidateWorkout.mockResolvedValue(undefined);

      const { result } = renderHook(() => useWorkoutMutations(workoutId), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.unvalidateWorkout();
      });

      expect(mockFirestoreService.unvalidateWorkout).toHaveBeenCalledWith('user123', workoutId);
    });

    it('should throw error when user or workoutId is missing', async () => {
      mockUseAuthenticatedUser.mockImplementation(() => {
        throw new Error('User or workout ID is missing');
      });

      expect(() => {
        renderHook(() => useWorkoutMutations('workout123'), {
          wrapper: createWrapper(),
        });
      }).toThrow('User or workout ID is missing');
    });

    it('should invalidate queries on success', async () => {
      const workoutId = 'workout123';
      const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

      mockFirestoreService.unvalidateWorkout.mockResolvedValue(undefined);

      const { result } = renderHook(() => useWorkoutMutations(workoutId), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.unvalidateWorkout();
      });

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledTimes(4);
      });
    });

    it('should track pending state', async () => {
      const workoutId = 'workout123';
      let resolveUnvalidate: () => void;
      const unvalidatePromise = new Promise<void>((resolve) => {
        resolveUnvalidate = resolve;
      });

      mockFirestoreService.unvalidateWorkout.mockReturnValue(unvalidatePromise);

      const { result } = renderHook(() => useWorkoutMutations(workoutId), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.unvalidateWorkout();
      });

      await waitFor(() => {
        expect(result.current.isUnvalidating).toBe(true);
      });

      await act(async () => {
        resolveUnvalidate!();
        await unvalidatePromise;
      });

      await waitFor(() => {
        expect(result.current.isUnvalidating).toBe(false);
      });
    });
  });

  describe('deleteWorkout', () => {
    it('should call deleteWorkout mutation successfully', async () => {
      const workoutId = 'workout123';
      mockFirestoreService.deleteWorkout.mockResolvedValue(undefined);

      const { result } = renderHook(() => useWorkoutMutations(workoutId), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.deleteWorkout();
      });

      expect(mockFirestoreService.deleteWorkout).toHaveBeenCalledWith('user123', workoutId);
    });

    it('should throw error when user or workoutId is missing', async () => {
      mockUseAuthenticatedUser.mockImplementation(() => {
        throw new Error('User or workout ID is missing');
      });

      expect(() => {
        renderHook(() => useWorkoutMutations('workout123'), {
          wrapper: createWrapper(),
        });
      }).toThrow('User or workout ID is missing');
    });

    it('should invalidate queries on success', async () => {
      const workoutId = 'workout123';
      const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

      mockFirestoreService.deleteWorkout.mockResolvedValue(undefined);

      const { result } = renderHook(() => useWorkoutMutations(workoutId), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.deleteWorkout();
      });

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledTimes(4);
      });
    });

    it('should track pending state', async () => {
      const workoutId = 'workout123';
      let resolveDelete: () => void;
      const deletePromise = new Promise<void>((resolve) => {
        resolveDelete = resolve;
      });

      mockFirestoreService.deleteWorkout.mockReturnValue(deletePromise);

      const { result } = renderHook(() => useWorkoutMutations(workoutId), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.deleteWorkout();
      });

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(true);
      });

      await act(async () => {
        resolveDelete!();
        await deletePromise;
      });

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });
    });
  });

  describe('undefined workoutId', () => {
    it('should handle undefined workoutId', async () => {
      const { result } = renderHook(() => useWorkoutMutations(undefined), {
        wrapper: createWrapper(),
      });

      const workoutInput: WorkoutInput = {
        date: new Date('2024-06-15'),
        exercises: [],
      };

      await expect(
        act(async () => {
          await result.current.updateWorkout(workoutInput);
        }),
      ).rejects.toThrow('Workout ID is missing');
    });
  });

  describe('error handling', () => {
    it('should propagate errors from service', async () => {
      const workoutId = 'workout123';
      const error = new Error('Service error');
      mockFirestoreService.updateWorkout.mockRejectedValue(error);

      const { result } = renderHook(() => useWorkoutMutations(workoutId), {
        wrapper: createWrapper(),
      });

      const workoutInput: WorkoutInput = {
        date: new Date('2024-06-15'),
        exercises: [],
      };

      await expect(
        act(async () => {
          await result.current.updateWorkout(workoutInput);
        }),
      ).rejects.toThrow('Service error');
    });
  });
});
