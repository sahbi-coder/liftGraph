import { useCallback } from 'react';
import type {
  ProgramType,
  ProgramWeekForm,
  ProgramDayForm,
  ProgramPhaseForm,
} from './useProgramForm/types';
import type { ProgramDayLabel } from '@/services';

type UseProgramDaySelectionParams = {
  programType: ProgramType;

  setWeeks: React.Dispatch<React.SetStateAction<ProgramWeekForm[]>>;
  setAlternatingWeeks: React.Dispatch<React.SetStateAction<ProgramWeekForm[]>>;
  setPhases: React.Dispatch<React.SetStateAction<ProgramPhaseForm[]>>;
};

export function useProgramDaySelection({
  programType,
  setWeeks,
  setAlternatingWeeks,
  setPhases,
}: UseProgramDaySelectionParams) {
  const handleDaySelectionChange = useCallback(
    (weekId: string, selectedDays: ProgramDayLabel[], phaseId?: string) => {
      const dayMap: Record<ProgramDayLabel, number> = {
        Day1: 0,
        Day2: 1,
        Day3: 2,
        Day4: 3,
        Day5: 4,
        Day6: 5,
        Day7: 6,
      };

      if (programType === 'simple') {
        setWeeks((prev) =>
          prev.map((week) => {
            if (week.id !== weekId) return week;

            const newDays: ('rest' | ProgramDayForm)[] = [...week.days];
            const selectedIndices = new Set(selectedDays.map((day) => dayMap[day]));

            // Update days array: selected days become ProgramDayForm, unselected become 'rest'
            for (let i = 0; i < 7; i++) {
              if (selectedIndices.has(i)) {
                // If it was 'rest', create new day form, otherwise keep existing
                if (newDays[i] === 'rest') {
                  newDays[i] = { name: '', exercises: [] };
                }
              } else {
                // If it was a day form, convert to 'rest'
                newDays[i] = 'rest';
              }
            }

            return { ...week, days: newDays, selectedDays };
          }),
        );
      } else if (programType === 'alternating') {
        setAlternatingWeeks((prev) =>
          prev.map((week) => {
            if (week.id !== weekId) return week;

            const newDays: ('rest' | ProgramDayForm)[] = [...week.days];
            const selectedIndices = new Set(selectedDays.map((day) => dayMap[day]));

            for (let i = 0; i < 7; i++) {
              if (selectedIndices.has(i)) {
                if (newDays[i] === 'rest') {
                  newDays[i] = { name: '', exercises: [] };
                }
              } else {
                newDays[i] = 'rest';
              }
            }

            return { ...week, days: newDays, selectedDays };
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

                const newDays: ('rest' | ProgramDayForm)[] = [...week.days];
                const selectedIndices = new Set(selectedDays.map((day) => dayMap[day]));

                for (let i = 0; i < 7; i++) {
                  if (selectedIndices.has(i)) {
                    if (newDays[i] === 'rest') {
                      newDays[i] = { name: '', exercises: [] };
                    }
                  } else {
                    newDays[i] = 'rest';
                  }
                }

                return { ...week, days: newDays, selectedDays };
              }),
            };
          }),
        );
      }
    },
    [programType, setWeeks, setAlternatingWeeks, setPhases],
  );

  return {
    handleDaySelectionChange,
  };
}
