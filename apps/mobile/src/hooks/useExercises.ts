import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { getDeviceLanguage } from '@/locale/i18n';
import { useDependencies } from '@/dependencies/provider';
import { useAuthenticatedUser } from '@/contexts/AuthContext';

const language = getDeviceLanguage();

export function useExercises() {
  const { services } = useDependencies();
  const { user } = useAuthenticatedUser();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch: reactQueryRefetch,
  } = useQuery({
    queryKey: ['exercisesWithLibrary', user.uid],
    queryFn: async () => {
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
