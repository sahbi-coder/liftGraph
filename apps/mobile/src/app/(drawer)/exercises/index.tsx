import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { ExercisePickerScreen } from '@/components/exercises/ExercisePickerScreen';
import { useTranslation } from '@/hooks/common/useTranslation';
import type { ExerciseSelection } from '@/types/workout';

export default function ExercisesScreen() {
  const router = useRouter();
  const { t } = useTranslation();

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

  return (
    <ExercisePickerScreen
      onSelect={handleSelect}
      onCancel={() => router.back()}
      onCreateExercise={handleCreateExercise}
      showCreateButton
      showCancelButton={false}
      title={t('exercise.manageExercises')}
    />
  );
}
