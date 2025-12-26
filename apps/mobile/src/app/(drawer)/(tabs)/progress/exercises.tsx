import React, { useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { YStack, Text, Button } from 'tamagui';

import { colors } from '@/theme/colors';
import { ExercisePickerScreen } from '@/components/exercises/ExercisePickerScreen';
import { useExercises } from '@/hooks/exercise/useExercises';
import type { ExerciseSelection } from '@/types/workout';
import {
  getExercisePickerCallback,
  clearExercisePickerCallback,
} from '@/contexts/exercisePickerContext';
import { useTranslation } from '@/hooks/common/useTranslation';

export default function ProgressExercisePickerScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ filterByLoad?: string }>();
  const filterByLoad = params.filterByLoad === 'true';
  const { exercises, isLoading, isError, refetch } = useExercises();

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
          {t('exercise.failedToLoadExercises')}
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
      showCreateButton={false}
      title={t('progress.chooseExerciseForProgress')}
      filterByLoad={filterByLoad}
    />
  );
}
