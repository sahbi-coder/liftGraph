import { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ExerciseSelection } from '@/types/workout';
import { setExercisePickerCallback } from '@/contexts/exercisePickerContext';

export interface UseExerciseSelectionOptions {
  defaultExercise?: { id: string; name: string };
  exercisePickerPath?: string;
  filterByLoad?: boolean; // If true, only show exercises with 'load' in allowedUnits
  persistenceKey?: string; // If provided, will persist/restore the selected exercise
}

const STORAGE_PREFIX = 'progress_selected_exercise_';

export interface UseExerciseSelectionResult {
  selectedExercise: { id: string; name: string };
  setSelectedExercise: (exercise: { id: string; name: string }) => void;
  handleExerciseSelect: (exercise: ExerciseSelection) => void;
  handleOpenExercisePicker: () => void;
}

/**
 * Custom hook that manages exercise selection state and handles exercise picker navigation.
 * Consolidates the exercise selection pattern used across progress chart screens.
 * If persistenceKey is provided, the selected exercise will be persisted to AsyncStorage.
 */
export function useExerciseSelection({
  defaultExercise = { id: 'squat', name: 'Squat' },
  exercisePickerPath = '/(tabs)/progress/exercises',
  filterByLoad = false,
  persistenceKey,
}: UseExerciseSelectionOptions = {}): UseExerciseSelectionResult {
  const router = useRouter();
  const storageKey = persistenceKey ? `${STORAGE_PREFIX}${persistenceKey}` : null;
  const [selectedExercise, setSelectedExerciseState] = useState<{ id: string; name: string }>(
    defaultExercise,
  );
  const [isInitialized, setIsInitialized] = useState(!persistenceKey); // Skip initialization if no persistence

  // Load persisted value on mount if persistenceKey is provided
  useEffect(() => {
    if (!storageKey) return;

    let isMounted = true;

    const loadPersistedExercise = async () => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored && isMounted) {
          const parsed = JSON.parse(stored) as { id: string; name: string };
          // Validate that we have both id and name
          if (parsed?.id && parsed?.name) {
            setSelectedExerciseState(parsed);
          }
        }
      } catch (error) {
        console.error(`Error loading persisted exercise for ${persistenceKey}:`, error);
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };

    loadPersistedExercise();

    return () => {
      isMounted = false;
    };
  }, [storageKey, persistenceKey]);

  // Persist value when it changes (if persistenceKey is provided)
  useEffect(() => {
    if (!storageKey || !isInitialized) return;

    // Save whenever the exercise changes
    AsyncStorage.setItem(storageKey, JSON.stringify(selectedExercise)).catch((error) => {
      console.error(`Error persisting exercise for ${persistenceKey}:`, error);
    });
  }, [selectedExercise, storageKey, persistenceKey, isInitialized]);

  // Also persist on unmount as a safety measure
  useEffect(() => {
    if (!storageKey || !isInitialized) return;

    return () => {
      // Save on unmount as backup
      AsyncStorage.setItem(storageKey, JSON.stringify(selectedExercise)).catch((error) => {
        console.error(`Error persisting exercise on unmount for ${persistenceKey}:`, error);
      });
    };
  }, [selectedExercise, storageKey, persistenceKey, isInitialized]);

  const handleExerciseSelect = useCallback((exercise: ExerciseSelection) => {
    setSelectedExerciseState({ id: exercise.id, name: exercise.name });
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
    selectedExercise,
    setSelectedExercise: setSelectedExerciseState,
    handleExerciseSelect,
    handleOpenExercisePicker,
  };
}
