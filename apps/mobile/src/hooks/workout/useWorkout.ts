import { useQuery } from '@tanstack/react-query';

import { useDependencies } from '@/dependencies/provider';
import { useAuthenticatedUser } from '@/contexts/AuthContext';

export function useWorkout(workoutId: string | undefined) {
  const { services } = useDependencies();
  const { user } = useAuthenticatedUser();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch: reactQueryRefetch,
  } = useQuery({
    queryKey: ['workout', user.uid, workoutId],
    enabled: !!workoutId,
    queryFn: async () => {
      if (!workoutId) {
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
