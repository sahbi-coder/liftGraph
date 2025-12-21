import { useCallback } from 'react';
import type { ProgramType, ProgramWeekForm, ProgramPhaseForm } from './useProgramForm/types';
import type { ProgramDayLabel } from '@/services';
import { createSetForm } from './useProgramForm/types';

type UseProgramSetsParams = {
  programType: ProgramType;

  setWeeks: React.Dispatch<React.SetStateAction<ProgramWeekForm[]>>;
  setAlternatingWeeks: React.Dispatch<React.SetStateAction<ProgramWeekForm[]>>;
  setPhases: React.Dispatch<React.SetStateAction<ProgramPhaseForm[]>>;
  showWarning: (message: string) => void;
  t: (key: string) => string;
};

export function useProgramSets({
  programType,
  setWeeks,
  setAlternatingWeeks,
  setPhases,
  showWarning,
  t,
}: UseProgramSetsParams) {
  const handleAddSet = useCallback(
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
              exercises: day.exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, sets: [...ex.sets, createSetForm()] } : ex,
              ),
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
              exercises: day.exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, sets: [...ex.sets, createSetForm()] } : ex,
              ),
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
                  exercises: day.exercises.map((ex) =>
                    ex.id === exerciseId ? { ...ex, sets: [...ex.sets, createSetForm()] } : ex,
                  ),
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

  const handleRemoveSet = useCallback(
    (
      weekId: string,
      dayId: ProgramDayLabel,
      exerciseId: string,
      setId: string,
      phaseId?: string,
    ) => {
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
              exercises: day.exercises.map((ex) => {
                if (ex.id !== exerciseId) return ex;
                if (ex.sets.length === 1) {
                  showWarning(t('workout.eachExerciseMustHaveSet'));
                  return ex;
                }
                return { ...ex, sets: ex.sets.filter((set) => set.id !== setId) };
              }),
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
              exercises: day.exercises.map((ex) => {
                if (ex.id !== exerciseId) return ex;
                if (ex.sets.length === 1) {
                  showWarning(t('workout.eachExerciseMustHaveSet'));
                  return ex;
                }
                return { ...ex, sets: ex.sets.filter((set) => set.id !== setId) };
              }),
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
                  exercises: day.exercises.map((ex) => {
                    if (ex.id !== exerciseId) return ex;
                    if (ex.sets.length === 1) {
                      showWarning(t('workout.eachExerciseMustHaveSet'));
                      return ex;
                    }
                    return { ...ex, sets: ex.sets.filter((set) => set.id !== setId) };
                  }),
                };
                return { ...week, days: newDays };
              }),
            };
          }),
        );
      }
    },
    [programType, setWeeks, setAlternatingWeeks, setPhases, showWarning, t],
  );

  const handleUpdateSetField = useCallback(
    (
      weekId: string,
      dayId: ProgramDayLabel,
      exerciseId: string,
      setId: string,
      field: 'reps' | 'rir',
      value: string,
      phaseId?: string,
    ) => {
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
              exercises: day.exercises.map((ex) =>
                ex.id === exerciseId
                  ? {
                      ...ex,
                      sets: ex.sets.map((set) =>
                        set.id === setId ? { ...set, [field]: value } : set,
                      ),
                    }
                  : ex,
              ),
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
              exercises: day.exercises.map((ex) =>
                ex.id === exerciseId
                  ? {
                      ...ex,
                      sets: ex.sets.map((set) =>
                        set.id === setId ? { ...set, [field]: value } : set,
                      ),
                    }
                  : ex,
              ),
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
                  exercises: day.exercises.map((ex) =>
                    ex.id === exerciseId
                      ? {
                          ...ex,
                          sets: ex.sets.map((set) =>
                            set.id === setId ? { ...set, [field]: value } : set,
                          ),
                        }
                      : ex,
                  ),
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

  return {
    handleAddSet,
    handleRemoveSet,
    handleUpdateSetField,
  };
}
