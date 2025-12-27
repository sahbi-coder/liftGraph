import React, { useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ExercisePickerScreen } from '@/components/exercises/ExercisePickerScreen';
import type { ExerciseSelection } from '@/types/workout';
import {
  getExercisePickerCallback,
  clearExercisePickerCallback,
} from '@/contexts/exercisePickerContext';

export default function ScheduleExercisePickerScreen() {
  const router = useRouter();

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

  return (
    <ExercisePickerScreen
      onSelect={handleSelect}
      onCancel={handleCancel}
      onCreateExercise={handleCreateExercise}
      showCreateButton
    />
  );
}
