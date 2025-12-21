import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

import { useDependencies } from '@/dependencies/provider';
import { useAuthenticatedUser } from '@/contexts/AuthContext';

export function useUserWorkouts() {
  const { services } = useDependencies();
  const { user } = useAuthenticatedUser();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch: reactQueryRefetch,
  } = useQuery({
    queryKey: ['workouts', user.uid],
    queryFn: async () => {
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
