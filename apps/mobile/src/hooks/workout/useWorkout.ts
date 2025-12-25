import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useDependencies } from '@/dependencies/provider';
import { useAuthenticatedUser } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/common/useTranslation';

export function useWorkout(workoutId: string | undefined) {
  const { services } = useDependencies();
  const { user } = useAuthenticatedUser();
  const { i18n } = useTranslation();
  const language = i18n.language;

  const {
    data: workoutData,
    isLoading: isWorkoutLoading,
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

  const { data: exercises, isLoading: isExercisesLoading } = useQuery({
    queryKey: ['exercises', user.uid, language],
    queryFn: async () => {
      return services.firestore.getUserExercises(user.uid, language);
    },
  });

  const workout = useMemo(() => {
    if (!workoutData || !exercises) {
      return workoutData;
    }

    // Create a map of exercise names for quick lookup
    const exerciseNameMap = new Map<string, string>();
    exercises.forEach((exercise) => {
      exerciseNameMap.set(exercise.id, exercise.name);
    });

    // Map workout exercises and replace names if found in exercise list
    const mappedExercises = workoutData.exercises.map((workoutExercise) => {
      const matchedExerciseName = exerciseNameMap.get(workoutExercise.exerciseId);

      if (matchedExerciseName) {
        return {
          ...workoutExercise,
          name: matchedExerciseName,
        };
      }

      return workoutExercise;
    });

    return {
      ...workoutData,
      exercises: mappedExercises,
    };
  }, [workoutData, exercises]);

  return {
    workout: workout ?? null,
    isLoading: isWorkoutLoading || isExercisesLoading,
    isError,
    error,
    refetch: () => reactQueryRefetch(),
  };
}
