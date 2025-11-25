import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { YStack, Text, Button } from 'tamagui';

import { colors } from '@/theme/colors';
import { ExercisePickerScreen } from '@/components/exercises/ExercisePickerScreen';
import { useExercisesWithLibrary } from '@/hooks/useExercisesWithLibrary';
import type { ExerciseSelection } from '@/app/(tabs)/workout/types';
import {
  getExercisePickerCallback,
  clearExercisePickerCallback,
} from '@/app/(tabs)/workout/exercisePickerContext';

export default function ProgressExercisePickerScreen() {
  const router = useRouter();
  const { exercises, isLoading, isError, refetch } = useExercisesWithLibrary();

  const handleSelect = useCallback(
    (exercise: ExerciseSelection) => {
      const contextCallback = getExercisePickerCallback();
      const effectiveOnSelect = contextCallback.callback;
      const effectiveContext = contextCallback.context;

      if (effectiveOnSelect) {
        try {
          effectiveOnSelect(exercise, effectiveContext || undefined);
        } catch (error) {
          console.error('Error executing callback from progress picker:', error);
        }
        clearExercisePickerCallback();
      }

      router.back();
    },
    [router],
  );

  const handleCancel = useCallback(() => {
    clearExercisePickerCallback();
    router.back();
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
      showCreateButton={false}
      title="Choose Exercise for Progress"
    />
  );
}
