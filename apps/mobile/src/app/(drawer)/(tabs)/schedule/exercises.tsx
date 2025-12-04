import React, { useCallback, useEffect } from 'react';
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
import { useTranslation } from '@/hooks/useTranslation';

export default function ScheduleExercisePickerScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const { exercises, isLoading, isError, refetch } = useExercisesWithLibrary();

  // Get the callback from context (set by WorkoutForm when navigating via router.push)
  const exercisePickerContext = getExercisePickerCallback();
  const onSelect = exercisePickerContext.callback;

  // Clear the callback when component unmounts
  useEffect(() => {
    return () => {
      clearExercisePickerCallback();
    };
  }, []);

  const handleSelect = useCallback(
    (exercise: ExerciseSelection) => {
      if (onSelect) {
        const context = exercisePickerContext.context ?? undefined;
        onSelect(exercise, context);
      }
      clearExercisePickerCallback();
      router.back();
    },
    [onSelect, router, exercisePickerContext.context],
  );

  const handleCancel = useCallback(() => {
    clearExercisePickerCallback();
    router.back();
  }, [router]);

  const handleCreateExercise = useCallback(() => {
    router.push('/(drawer)/(tabs)/schedule/exercise-create');
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
          {t('program.failedToLoadExercises')}
        </Text>
        <Button backgroundColor="$primaryButton" color={colors.white} onPress={() => refetch()}>
          {t('common.retry')}
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
