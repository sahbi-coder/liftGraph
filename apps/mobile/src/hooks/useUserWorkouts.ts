import { useQuery } from '@tanstack/react-query';

import { useDependencies } from '@/dependencies/provider';
import { useAuth } from '@/contexts/AuthContext';
import type { Workout } from '@/services/firestore';

type UseUserWorkoutsResult = {
  workouts: Workout[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
};

export function useUserWorkouts(): UseUserWorkoutsResult {
  const { services } = useDependencies();
  const { user } = useAuth();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch: reactQueryRefetch,
  } = useQuery({
    queryKey: ['workouts', user?.uid],
    enabled: !!user?.uid,
    queryFn: async () => {
      if (!user?.uid) {
        return [] as Workout[];
      }
      return services.firestore.getWorkouts(user.uid);
    },
  });

  return {
    workouts: data,
    isLoading,
    isError,
    error,
    refetch: () => reactQueryRefetch(),
  };
}
