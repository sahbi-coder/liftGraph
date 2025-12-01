import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import type { ExerciseSelection } from '@/types/workout';
import { setExercisePickerCallback } from '@/contexts/exercisePickerContext';

export interface UseExerciseSelectionOptions {
  defaultExercise?: { id: string; name: string };
  exercisePickerPath?: string;
}

export interface UseExerciseSelectionResult {
  selectedExercise: { id: string; name: string };
  setSelectedExercise: (exercise: { id: string; name: string }) => void;
  handleExerciseSelect: (exercise: ExerciseSelection) => void;
  handleOpenExercisePicker: () => void;
}

/**
 * Custom hook that manages exercise selection state and handles exercise picker navigation.
 * Consolidates the exercise selection pattern used across progress chart screens.
 */
export function useExerciseSelection({
  defaultExercise = { id: 'squat', name: 'Squat' },
  exercisePickerPath = '/(tabs)/progress/exercises',
}: UseExerciseSelectionOptions = {}): UseExerciseSelectionResult {
  const router = useRouter();
  const [selectedExercise, setSelectedExercise] = useState<{ id: string; name: string }>(
    defaultExercise,
  );

  const handleExerciseSelect = useCallback((exercise: ExerciseSelection) => {
    setSelectedExercise({ id: exercise.id, name: exercise.name });
  }, []);

  const handleOpenExercisePicker = useCallback(() => {
    setExercisePickerCallback(handleExerciseSelect);
    router.push(exercisePickerPath as any);
  }, [handleExerciseSelect, router, exercisePickerPath]);

  return {
    selectedExercise,
    setSelectedExercise,
    handleExerciseSelect,
    handleOpenExercisePicker,
  };
}
