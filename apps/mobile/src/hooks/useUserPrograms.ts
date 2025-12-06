import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

import { useDependencies } from '@/dependencies/provider';
import { useAuth } from '@/contexts/AuthContext';
import type { Program } from '@/services';

export function useUserPrograms() {
  const { services } = useDependencies();
  const { user } = useAuth();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch: reactQueryRefetch,
  } = useQuery({
    queryKey: ['programs', user?.uid],
    enabled: !!user?.uid,
    queryFn: async () => {
      if (!user?.uid) {
        return [] as Program[];
      }
      return services.firestore.getPrograms(user.uid);
    },
  });

  // Refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      reactQueryRefetch();
    }, [reactQueryRefetch]),
  );

  return {
    programs: data,
    isLoading,
    isError,
    error,
    refetch: () => reactQueryRefetch(),
  };
}
