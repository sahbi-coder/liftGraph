import React, { useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ExercisePickerScreen } from '@/components/exercises/ExercisePickerScreen';
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

  return (
    <ExercisePickerScreen
      onSelect={handleSelect}
      onCancel={handleCancel}
      showCreateButton={false}
      title={t('progress.chooseExerciseForProgress')}
      filterByLoad={filterByLoad}
    />
  );
}
