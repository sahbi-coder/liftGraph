import { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';

/**
 * Extracts and normalizes workout ID from route parameters.
 * Handles both string and string[] types from expo-router params.
 */
export function useWorkoutIdFromParams(): string | undefined {
  const { workoutId: workoutIdParam } = useLocalSearchParams<{ workoutId?: string | string[] }>();

  return useMemo(() => {
    if (Array.isArray(workoutIdParam)) {
      return workoutIdParam[0];
    }
    return workoutIdParam;
  }, [workoutIdParam]);
}
