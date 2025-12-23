import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { YStack, Text, Button } from 'tamagui';

import { colors } from '@/theme/colors';
import { ExercisePickerScreen } from '@/components/exercises/ExercisePickerScreen';
import { useExercises } from '@/hooks/exercise/useExercises';
import { useTranslation } from '@/hooks/common/useTranslation';
import type { ExerciseSelection } from '@/types/workout';

export default function ExercisesScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const { exercises, isLoading, isError, refetch } = useExercises();

  const handleSelect = useCallback(
    (exerciseSelection: ExerciseSelection) => {
      // Navigate to edit screen when an exercise is selected
      router.push(`/(drawer)/exercises/${exerciseSelection.id}`);
    },
    [router],
  );

  const handleCreateExercise = useCallback(() => {
    router.push('/(drawer)/exercises/exercise-create');
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
      onCancel={() => router.back()}
      onCreateExercise={handleCreateExercise}
      showCreateButton
      showCancelButton={false}
      title={t('exercise.manageExercises')}
    />
  );
}
