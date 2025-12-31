import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import type { ExerciseSelection } from '@/types/workout';
import { setExercisePickerCallback } from '@/contexts/exercisePickerContext';

export interface UseMultipleExerciseSelectionOptions {
  defaultExercises?: { id: string; name: string }[];
  exercisePickerPath?: string;
  filterByLoad?: boolean; // If true, only show exercises with 'load' in allowedUnits
}

export interface UseMultipleExerciseSelectionResult {
  selectedExercises: { id: string; name: string }[];
  setSelectedExercises: (exercises: { id: string; name: string }[]) => void;
  handleExerciseSelect: (exercise: ExerciseSelection) => void;
  handleOpenExercisePicker: () => void;
  removeExercise: (exerciseId: string) => void;
}

/**
 * Custom hook that manages multiple exercise selection state and handles exercise picker navigation.
 * Allows selecting multiple exercises for comparison charts.
 */
export function useMultipleExerciseSelection({
  defaultExercises = [],
  exercisePickerPath = '/(tabs)/progress/exercises',
  filterByLoad = false,
}: UseMultipleExerciseSelectionOptions = {}): UseMultipleExerciseSelectionResult {
  const router = useRouter();
  const [selectedExercises, setSelectedExercises] =
    useState<{ id: string; name: string }[]>(defaultExercises);

  const handleExerciseSelect = useCallback(
    (exercise: ExerciseSelection) => {
      // Check if exercise is already selected
      const isAlreadySelected = selectedExercises.some((ex) => ex.id === exercise.id);

      if (!isAlreadySelected) {
        // Add to selected exercises
        setSelectedExercises((prev) => [...prev, { id: exercise.id, name: exercise.name }]);
      }
    },
    [selectedExercises],
  );

  const removeExercise = useCallback((exerciseId: string) => {
    setSelectedExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  }, []);

  const handleOpenExercisePicker = useCallback(() => {
    setExercisePickerCallback(handleExerciseSelect);
    // Pass filterByLoad as route param
    const pathWithParams = filterByLoad
      ? `${exercisePickerPath}?filterByLoad=true`
      : exercisePickerPath;
    router.push(pathWithParams);
  }, [handleExerciseSelect, router, exercisePickerPath, filterByLoad]);

  return {
    selectedExercises,
    setSelectedExercises,
    handleExerciseSelect,
    handleOpenExercisePicker,
    removeExercise,
  };
}
