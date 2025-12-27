import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { ExercisePickerScreen } from '@/components/exercises/ExercisePickerScreen';
import type { ExerciseSelection } from '@/types/workout';
import {
  getExercisePickerCallback,
  clearExercisePickerCallback,
} from '@/contexts/exercisePickerContext';

export default function ProgramExercisePickerScreen() {
  const router = useRouter();

  const handleSelect = useCallback(
    (exercise: ExerciseSelection) => {
      // Get fresh callback and context from the context module
      const contextCallback = getExercisePickerCallback();
      const effectiveOnSelect = contextCallback.callback;
      const effectiveContext = contextCallback.context;

      if (effectiveOnSelect) {
        try {
          effectiveOnSelect(exercise, effectiveContext || undefined);
        } catch (error) {
          console.error('Error executing callback:', error);
        }
        clearExercisePickerCallback();
        router.back();
      } else {
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

  return (
    <ExercisePickerScreen
      onSelect={handleSelect}
      onCancel={handleCancel}
      onCreateExercise={handleCreateExercise}
      showCreateButton
    />
  );
}
