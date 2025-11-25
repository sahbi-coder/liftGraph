import { useQuery } from '@tanstack/react-query';

import { useDependencies } from '@/dependencies/provider';
import { useAuth } from '@/contexts/AuthContext';
import type { Workout } from '@/services/firestore';

type UseWorkoutResult = {
  workout: Workout | null | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
};

export function useWorkout(workoutId: string | undefined): UseWorkoutResult {
  const { services } = useDependencies();
  const { user } = useAuth();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch: reactQueryRefetch,
  } = useQuery({
    queryKey: ['workout', user?.uid, workoutId],
    enabled: !!user?.uid && !!workoutId,
    queryFn: async () => {
      if (!user?.uid || !workoutId) {
        return null;
      }
      return services.firestore.getWorkout(user.uid, workoutId);
    },
  });

  return {
    workout: data ?? null,
    isLoading,
    isError,
    error,
    refetch: () => reactQueryRefetch(),
  };
}
