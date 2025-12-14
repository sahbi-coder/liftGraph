import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

import { useDependencies } from '@/dependencies/provider';
import { useAuthenticatedUser } from '@/contexts/AuthContext';

export function useEarliestFutureWorkout() {
  const { services } = useDependencies();
  const { user } = useAuthenticatedUser();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch: reactQueryRefetch,
  } = useQuery({
    queryKey: ['earliestFutureWorkout', user?.uid],
    enabled: !!user.uid,
    queryFn: async () => {
      return services.firestore.getEarliestNonValidatedFutureWorkout(user.uid);
    },
  });

  // Refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      reactQueryRefetch();
    }, [reactQueryRefetch]),
  );

  return {
    workout: data,
    isLoading,
    isError,
    error,
    refetch: () => reactQueryRefetch(),
  };
}
