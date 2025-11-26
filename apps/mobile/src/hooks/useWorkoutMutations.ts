import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useDependencies } from '@/dependencies/provider';
import { useAuth } from '@/contexts/AuthContext';
import type { WorkoutInput } from '@/services/firestore';

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
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['workout', user?.uid, workoutId] });
      queryClient.invalidateQueries({ queryKey: ['workouts', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['latestValidatedWorkout', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['earliestFutureWorkout', user?.uid] });
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
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['workout', user?.uid, workoutId] });
      queryClient.invalidateQueries({ queryKey: ['workouts', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['latestValidatedWorkout', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['earliestFutureWorkout', user?.uid] });
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
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['workout', user?.uid, workoutId] });
      queryClient.invalidateQueries({ queryKey: ['workouts', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['latestValidatedWorkout', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['earliestFutureWorkout', user?.uid] });
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
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['workout', user?.uid, workoutId] });
      queryClient.invalidateQueries({ queryKey: ['workouts', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['latestValidatedWorkout', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['earliestFutureWorkout', user?.uid] });
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
