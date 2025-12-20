import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useDependencies } from '@/dependencies/provider';
import { useAuthenticatedUser } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';

export function useExercises() {
  const { services } = useDependencies();
  const { user } = useAuthenticatedUser();
  const { i18n } = useTranslation();
  const language = i18n.language;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch: reactQueryRefetch,
  } = useQuery({
    queryKey: ['exercisesWithLibrary', user.uid, language],
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
