import { useMemo } from 'react';
import { useUserWorkouts } from './useUserWorkouts';
import { getValidatedWorkouts } from '@/utils/workout';

/**
 * Hook that wraps useUserWorkouts and automatically filters to only validated workouts.
 * This is a convenience hook for screens that only need validated workouts.
 */
export function useValidatedWorkouts() {
  const { workouts, isLoading, isError, error, refetch } = useUserWorkouts();

  const validatedWorkouts = useMemo(() => getValidatedWorkouts(workouts), [workouts]);

  return {
    workouts: validatedWorkouts,
    isLoading,
    isError,
    error,
    refetch,
  };
}
