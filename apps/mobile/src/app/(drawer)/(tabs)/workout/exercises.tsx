import React, { useCallback, useEffect } from 'react';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { ExercisePickerScreen } from '@/components/exercises/ExercisePickerScreen';
import type { ExerciseSelection } from '@/types/workout';
import {
  getExercisePickerCallback,
  clearExercisePickerCallback,
} from '@/contexts/exercisePickerContext';

type ExercisePickerParams = {
  onSelect?: (exercise: ExerciseSelection) => void;
};

type WorkoutStackParamList = {
  index: undefined;
  create: undefined;
  exercises: ExercisePickerParams;
};

type RouteParams = RouteProp<WorkoutStackParamList, 'exercises'>;

export default function WorkoutExercisePickerScreen() {
  const navigation = useNavigation<NavigationProp<WorkoutStackParamList>>();
  const router = useRouter();
  const route = useRoute<RouteParams>();
  const routeOnSelect = route.params?.onSelect;

  // Get the callback from context (set by WorkoutForm when navigating via router.push)
  const exercisePickerContext = getExercisePickerCallback();
  const contextOnSelect = exercisePickerContext.callback;

  // Use context callback if available, otherwise fall back to route params (for React Navigation)
  const onSelect = contextOnSelect || routeOnSelect;

  // Clear the callback when component unmounts
  useEffect(() => {
    return () => {
      clearExercisePickerCallback();
    };
  }, []);

  const handleSelect = useCallback(
    (exercise: ExerciseSelection) => {
      if (onSelect) {
        // Context callback may accept a context parameter
        if (contextOnSelect) {
          const context = exercisePickerContext.context ?? undefined;
          contextOnSelect(exercise, context);
          clearExercisePickerCallback();
        } else if (routeOnSelect) {
          // Route params callback doesn't accept context
          routeOnSelect(exercise);
        }
      }
      router.back();
    },
    [onSelect, contextOnSelect, routeOnSelect, router, exercisePickerContext.context],
  );

  const handleCancel = useCallback(() => {
    clearExercisePickerCallback();
    if (contextOnSelect) {
      router.back();
    } else {
      navigation.goBack();
    }
  }, [navigation, router, contextOnSelect]);

  const handleCreateExercise = useCallback(() => {
    router.push('/(drawer)/(tabs)/workout/exercise-create');
  }, [router]);

  return (
    <ExercisePickerScreen
      onSelect={handleSelect}
      onCancel={handleCancel}
      onCreateExercise={handleCreateExercise}
      showCreateButton
    />
  );
}
