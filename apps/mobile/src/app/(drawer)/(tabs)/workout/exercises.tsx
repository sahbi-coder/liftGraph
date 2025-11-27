import React, { useCallback } from 'react';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { YStack, Text, Button } from 'tamagui';

import { colors } from '@/theme/colors';
import { ExercisePickerScreen } from '@/components/exercises/ExercisePickerScreen';
import { useExercisesWithLibrary } from '@/hooks/useExercisesWithLibrary';
import type { ExerciseSelection } from '@/types/workout';

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
  const onSelect = route.params?.onSelect;

  const { exercises, isLoading, isError, refetch } = useExercisesWithLibrary();

  const handleSelect = useCallback(
    (exercise: ExerciseSelection) => {
      if (onSelect) {
        onSelect(exercise);
      } else {
        console.log('Selected exercise:', exercise.id, exercise.name, exercise.source);
      }
      router.back();
    },
    [onSelect, router],
  );

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleCreateExercise = useCallback(() => {
    router.push('/(drawer)/(tabs)/workout/exercise-create');
  }, [router]);

  // Show error state
  if (isError) {
    return (
      <YStack
        flex={1}
        backgroundColor={colors.darkerGray}
        justifyContent="center"
        alignItems="center"
        padding="$4"
        space="$4"
      >
        <Text color="$textPrimary" fontSize="$5" textAlign="center">
          Failed to load exercises
        </Text>
        <Button backgroundColor="$primaryButton" color={colors.white} onPress={() => refetch()}>
          Retry
        </Button>
      </YStack>
    );
  }

  return (
    <ExercisePickerScreen
      exercises={exercises ?? []}
      isLoading={isLoading}
      onSelect={handleSelect}
      onCancel={handleCancel}
      onCreateExercise={handleCreateExercise}
      showCreateButton
    />
  );
}
