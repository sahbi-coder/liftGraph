import { useQuery } from '@tanstack/react-query';

import { useDependencies } from '@/dependencies/provider';
import { useAuth } from '@/contexts/AuthContext';

export function useWorkout(workoutId: string | undefined) {
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
