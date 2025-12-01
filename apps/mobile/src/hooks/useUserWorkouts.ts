import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

import { useDependencies } from '@/dependencies/provider';
import { useAuth } from '@/contexts/AuthContext';
import type { Workout } from '@/domain';

export function useUserWorkouts() {
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

  // Refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      reactQueryRefetch();
    }, [reactQueryRefetch]),
  );

  return {
    workouts: data,
    isLoading,
    isError,
    error,
    refetch: () => reactQueryRefetch(),
  };
}
