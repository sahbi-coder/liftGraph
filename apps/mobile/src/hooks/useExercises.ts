import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { getDeviceLanguage } from '@/locale/i18n';
import { useDependencies } from '@/dependencies/provider';
import { useAuth } from '@/contexts/AuthContext';
import type { Exercise } from '@/services';

const language = getDeviceLanguage();

export function useExercises() {
  const { services } = useDependencies();
  const { user } = useAuth();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch: reactQueryRefetch,
  } = useQuery({
    queryKey: ['exercisesWithLibrary', user?.uid],
    enabled: !!user?.uid,
    queryFn: async () => {
      if (!user?.uid) {
        return [] as Exercise[];
      }
      return services.firestore.getUserExercises(user.uid, language);
    },
  });

  // Refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      reactQueryRefetch();
    }, [reactQueryRefetch]),
  );

  return {
    exercises: data,
    isLoading,
    isError,
    error,
    refetch: () => reactQueryRefetch(),
  };
}
