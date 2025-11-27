import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { YStack, Text, Button } from 'tamagui';

import { colors } from '@/theme/colors';
import { ExercisePickerScreen } from '@/components/exercises/ExercisePickerScreen';
import { useExercisesWithLibrary } from '@/hooks/useExercisesWithLibrary';
import type { ExerciseSelection } from '@/types/workout';
import {
  getExercisePickerCallback,
  clearExercisePickerCallback,
} from '@/contexts/exercisePickerContext';

export default function ProgramExercisePickerScreen() {
  const router = useRouter();
  const { exercises, isLoading, isError, refetch } = useExercisesWithLibrary();

  const handleSelect = useCallback(
    (exercise: ExerciseSelection) => {
      // Get fresh callback and context from the context module
      const contextCallback = getExercisePickerCallback();
      const effectiveOnSelect = contextCallback.callback;
      const effectiveContext = contextCallback.context;

      console.log('Exercise selected:', exercise);
      console.log('Callback exists:', !!effectiveOnSelect);
      console.log('Context:', effectiveContext);

      if (effectiveOnSelect) {
        try {
          effectiveOnSelect(exercise, effectiveContext || undefined);
          console.log('Callback executed successfully');
        } catch (error) {
          console.error('Error executing callback:', error);
        }
        clearExercisePickerCallback();
        router.back();
      } else {
        console.log(
          'No callback found. Selected exercise:',
          exercise.id,
          exercise.name,
          exercise.source,
        );
        router.back();
      }
    },
    [router],
  );

  const handleCancel = useCallback(() => {
    clearExercisePickerCallback();
    router.back();
  }, [router]);

  const handleCreateExercise = useCallback(() => {
    router.push('/(drawer)/(tabs)/program/exercise-create');
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
