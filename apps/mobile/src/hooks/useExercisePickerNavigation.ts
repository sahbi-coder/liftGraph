import { useCallback } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import type { ExerciseSelection, WorkoutStackParamList } from '@/types/workout';
import { setExercisePickerCallback } from '@/contexts/exercisePickerContext';

type UseExercisePickerNavigationProps = {
  onSelectExercise: (exercise: ExerciseSelection) => void;
  validated: boolean;
  exerciseNavigationPath?: string;
};

export const useExercisePickerNavigation = ({
  onSelectExercise,
  validated,
  exerciseNavigationPath,
}: UseExercisePickerNavigationProps) => {
  const navigation = useNavigation<NavigationProp<WorkoutStackParamList>>();
  const router = useRouter();

  const handleOpenExercisePicker = useCallback(() => {
    if (validated) return;

    // Use context-aware navigation path if provided (for schedule), otherwise use React Navigation (for workout)
    if (exerciseNavigationPath) {
      // For expo-router navigation, use the exercise picker context to pass the callback
      setExercisePickerCallback(onSelectExercise);
      router.push(exerciseNavigationPath);
    } else {
      // For React Navigation (workout stack), pass callback directly via params
      navigation.navigate('exercises', { onSelect: onSelectExercise });
    }
  }, [onSelectExercise, navigation, router, validated, exerciseNavigationPath]);

  return {
    handleOpenExercisePicker,
  };
};
