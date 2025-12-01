import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useDependencies } from '@/dependencies/provider';
import { useAuth } from '@/contexts/AuthContext';
import type { WorkoutInput } from '@/domain';

/**
 * Helper function to invalidate all workout-related queries.
 * Extracted to avoid duplication across mutation onSuccess callbacks.
 */
function invalidateWorkoutQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string | undefined,
  workoutId: string | undefined,
) {
  queryClient.invalidateQueries({ queryKey: ['workout', userId, workoutId] });
  queryClient.invalidateQueries({ queryKey: ['workouts', userId] });
  queryClient.invalidateQueries({ queryKey: ['latestValidatedWorkout', userId] });
  queryClient.invalidateQueries({ queryKey: ['earliestFutureWorkout', userId] });
}

export function useWorkoutMutations(workoutId: string | undefined) {
  const { services } = useDependencies();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateWorkoutMutation = useMutation({
    mutationFn: async (workout: WorkoutInput) => {
      if (!user?.uid || !workoutId) {
        throw new Error('User or workout ID is missing');
      }
      return services.firestore.updateWorkout(user.uid, workoutId, workout);
    },
    onSuccess: () => {
      invalidateWorkoutQueries(queryClient, user?.uid, workoutId);
    },
  });

  const validateWorkoutMutation = useMutation({
    mutationFn: async () => {
      if (!user?.uid || !workoutId) {
        throw new Error('User or workout ID is missing');
      }
      return services.firestore.validateWorkout(user.uid, workoutId);
    },
    onSuccess: () => {
      invalidateWorkoutQueries(queryClient, user?.uid, workoutId);
    },
  });

  const unvalidateWorkoutMutation = useMutation({
    mutationFn: async () => {
      if (!user?.uid || !workoutId) {
        throw new Error('User or workout ID is missing');
      }
      return services.firestore.unvalidateWorkout(user.uid, workoutId);
    },
    onSuccess: () => {
      invalidateWorkoutQueries(queryClient, user?.uid, workoutId);
    },
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: async () => {
      if (!user?.uid || !workoutId) {
        throw new Error('User or workout ID is missing');
      }
      return services.firestore.deleteWorkout(user.uid, workoutId);
    },
    onSuccess: () => {
      invalidateWorkoutQueries(queryClient, user?.uid, workoutId);
    },
  });

  return {
    updateWorkout: updateWorkoutMutation.mutateAsync,
    isUpdating: updateWorkoutMutation.isPending,
    validateWorkout: validateWorkoutMutation.mutateAsync,
    isValidating: validateWorkoutMutation.isPending,
    unvalidateWorkout: unvalidateWorkoutMutation.mutateAsync,
    isUnvalidating: unvalidateWorkoutMutation.isPending,
    deleteWorkout: deleteWorkoutMutation.mutateAsync,
    isDeleting: deleteWorkoutMutation.isPending,
  };
}
