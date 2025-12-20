import { useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import type { ProgramType, ProgramWeekForm, ProgramPhaseForm } from './useProgramForm/types';
import type { ExerciseSelection, ExerciseSelectionContext } from '@/types/workout';
import type { ProgramDayLabel } from '@/services';
import { createExerciseForm } from './useProgramForm/types';
import {
  setExercisePickerCallback,
  clearExercisePickerCallback,
} from '@/contexts/exercisePickerContext';

type UseProgramExercisesParams = {
  programType: ProgramType;
  weeks: ProgramWeekForm[];
  alternatingWeeks: ProgramWeekForm[];
  phases: ProgramPhaseForm[];
  setWeeks: React.Dispatch<React.SetStateAction<ProgramWeekForm[]>>;
  setAlternatingWeeks: React.Dispatch<React.SetStateAction<ProgramWeekForm[]>>;
  setPhases: React.Dispatch<React.SetStateAction<ProgramPhaseForm[]>>;
};

export function useProgramExercises({
  programType,
  weeks,
  alternatingWeeks,
  phases,
  setWeeks,
  setAlternatingWeeks,
  setPhases,
}: UseProgramExercisesParams) {
  const router = useRouter();

  const handleSelectExercise = useCallback(
    (exercise: ExerciseSelection, context?: ExerciseSelectionContext) => {
      if (!context?.weekId || !context?.dayId) {
        return;
      }

      const newExercise = createExerciseForm(exercise);
      const weekId = context.weekId;
      const phaseId = context.phaseId;
      const dayId = context.dayId as ProgramDayLabel;
      const dayIndex = { Day1: 0, Day2: 1, Day3: 2, Day4: 3, Day5: 4, Day6: 5, Day7: 6 }[dayId];

      if (dayIndex === undefined) {
        console.error('Invalid dayId:', dayId);
        return;
      }

      if (programType === 'simple') {
        setWeeks((prev) => {
          const week = prev.find((w) => w.id === weekId);
          if (!week) {
            console.error('Week not found! Cannot add exercise.');
            return prev;
          }

          const newDays = [...week.days];
          const day = newDays[dayIndex];

          if (day === 'rest') {
            console.error('Cannot add exercise to rest day');
            return prev;
          }

          newDays[dayIndex] = {
            ...day,
            exercises: [...day.exercises, newExercise],
          };

          return prev.map((w) => (w.id === weekId ? { ...w, days: newDays } : w));
        });
      } else if (programType === 'alternating') {
        setAlternatingWeeks((prev) => {
          const week = prev.find((w) => w.id === weekId);
          if (!week) {
            console.error('Week not found! Cannot add exercise.');
            return prev;
          }

          const newDays = [...week.days];
          const day = newDays[dayIndex];

          if (day === 'rest') {
            console.error('Cannot add exercise to rest day');
            return prev;
          }

          newDays[dayIndex] = {
            ...day,
            exercises: [...day.exercises, newExercise],
          };

          return prev.map((w) => (w.id === weekId ? { ...w, days: newDays } : w));
        });
      } else if (phaseId) {
        setPhases((prev) => {
          return prev.map((phase) => {
            if (phase.id !== phaseId) return phase;

            return {
              ...phase,
              weeks: phase.weeks.map((week) => {
                if (week.id !== weekId) return week;

                const newDays = [...week.days];
                const day = newDays[dayIndex];

                if (day === 'rest') {
                  console.error('Cannot add exercise to rest day');
                  return week;
                }

                newDays[dayIndex] = {
                  ...day,
                  exercises: [...day.exercises, newExercise],
                };

                return { ...week, days: newDays };
              }),
            };
          });
        });
      }
    },
    [programType, setWeeks, setAlternatingWeeks, setPhases],
  );

  const handleOpenExercisePicker = useCallback(
    (weekId: string, dayId: ProgramDayLabel, phaseId?: string) => {
      const context: ExerciseSelectionContext = { weekId, phaseId, dayId };
      setExercisePickerCallback(handleSelectExercise, context, '/(drawer)/(tabs)/program/create');
      router.push('/(drawer)/(tabs)/program/exercises');
    },
    [handleSelectExercise, router],
  );

  const handleRemoveExercise = useCallback(
    (weekId: string, dayId: ProgramDayLabel, exerciseId: string, phaseId?: string) => {
      const dayIndex = { Day1: 0, Day2: 1, Day3: 2, Day4: 3, Day5: 4, Day6: 5, Day7: 6 }[dayId];
      if (dayIndex === undefined) return;

      if (programType === 'simple') {
        setWeeks((prev) =>
          prev.map((week) => {
            if (week.id !== weekId) return week;
            const newDays = [...week.days];
            const day = newDays[dayIndex];
            if (day === 'rest') return week;

            newDays[dayIndex] = {
              ...day,
              exercises: day.exercises.filter((ex) => ex.id !== exerciseId),
            };
            return { ...week, days: newDays };
          }),
        );
      } else if (programType === 'alternating') {
        setAlternatingWeeks((prev) =>
          prev.map((week) => {
            if (week.id !== weekId) return week;
            const newDays = [...week.days];
            const day = newDays[dayIndex];
            if (day === 'rest') return week;

            newDays[dayIndex] = {
              ...day,
              exercises: day.exercises.filter((ex) => ex.id !== exerciseId),
            };
            return { ...week, days: newDays };
          }),
        );
      } else if (phaseId) {
        setPhases((prev) =>
          prev.map((phase) => {
            if (phase.id !== phaseId) return phase;
            return {
              ...phase,
              weeks: phase.weeks.map((week) => {
                if (week.id !== weekId) return week;
                const newDays = [...week.days];
                const day = newDays[dayIndex];
                if (day === 'rest') return week;

                newDays[dayIndex] = {
                  ...day,
                  exercises: day.exercises.filter((ex) => ex.id !== exerciseId),
                };
                return { ...week, days: newDays };
              }),
            };
          }),
        );
      }
    },
    [programType, setWeeks, setAlternatingWeeks, setPhases],
  );

  // Clear the callback when component unmounts (e.g., when switching tabs)
  // Don't clear on focus loss because that happens when navigating to exercise picker
  useEffect(() => {
    return () => {
      // Only clear on unmount, not on focus loss
      clearExercisePickerCallback();
    };
  }, []);

  return {
    handleSelectExercise,
    handleOpenExercisePicker,
    handleRemoveExercise,
  };
}
