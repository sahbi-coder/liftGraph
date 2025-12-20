import { useCallback } from 'react';
import type { ProgramType, ProgramWeekForm, ProgramPhaseForm } from './useProgramForm/types';
import type { AlternatingWeeks, ProgramDayLabel } from '@/services';

type UseProgramValidationParams = {
  name: string;
  description: string;
  programType: ProgramType;
  weeks: ProgramWeekForm[];
  alternatingWeeks: ProgramWeekForm[];
  phases: ProgramPhaseForm[];
  showError: (message: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
};

export function useProgramValidation({
  name,
  description,
  programType,
  weeks,
  alternatingWeeks,
  phases,
  showError,
  t,
}: UseProgramValidationParams) {
  const validateAndConvert = useCallback(() => {
    if (!name.trim()) {
      showError(t('program.programNameRequired'));
      return null;
    }

    if (!description.trim()) {
      showError(t('program.programDescriptionRequired'));
      return null;
    }

    if (programType === 'simple') {
      if (weeks.length === 0) {
        showError(t('program.simpleProgramMustHaveWeek'));
        return null;
      }

      // Simple programs use only the first week
      const week = weeks[0];
      const dayLabels: ProgramDayLabel[] = ['Day1', 'Day2', 'Day3', 'Day4', 'Day5', 'Day6', 'Day7'];
      const convertedDays = week.days.map((day, dayIndex) => {
        if (day === 'rest') {
          return 'rest' as const;
        }

        const exercises = day.exercises.map((ex) => {
          const sets = ex.sets
            .filter((set) => set.reps.trim() && set.rir.trim())
            .map((set) => ({
              reps: Number(set.reps),
              rir: Number(set.rir),
            }));

          if (sets.length === 0) {
            throw new Error(t('program.exerciseMustHaveValidSet', { name: ex.name }));
          }

          return {
            name: ex.name,
            id: ex.exerciseId,
            sets,
          };
        });

        return {
          name: dayLabels[dayIndex],
          exercises,
        };
      });

      const convertedWeek = {
        days: convertedDays,
      };

      const simpleProgram = {
        name: name.trim(),
        description: description.trim(),
        type: 'simple' as const,
        week: convertedWeek,
      };

      return simpleProgram;
    } else if (programType === 'alternating') {
      if (alternatingWeeks.length !== 2) {
        showError(t('program.alternatingProgramMustHaveWeeks'));
        return null;
      }

      const dayLabels: ProgramDayLabel[] = ['Day1', 'Day2', 'Day3', 'Day4', 'Day5', 'Day6', 'Day7'];

      const convertWeek = (week: ProgramWeekForm) => {
        const convertedDays = week.days.map((day, dayIndex) => {
          if (day === 'rest') {
            return 'rest' as const;
          }

          const exercises = day.exercises.map((ex) => {
            const sets = ex.sets
              .filter((set) => set.reps.trim() && set.rir.trim())
              .map((set) => ({
                reps: Number(set.reps),
                rir: Number(set.rir),
              }));

            if (sets.length === 0) {
              throw new Error(t('program.exerciseMustHaveValidSet', { name: ex.name }));
            }

            return {
              name: ex.name,
              id: ex.exerciseId,
              sets,
            };
          });

          return {
            name: dayLabels[dayIndex],
            exercises,
          };
        });

        return {
          days: convertedDays,
        };
      };

      const convertedWeeks: AlternatingWeeks = [
        convertWeek(alternatingWeeks[0]),
        convertWeek(alternatingWeeks[1]),
      ];

      const alternatingProgram = {
        name: name.trim(),
        description: description.trim(),
        type: 'alternating' as const,
        alternatingWeeks: convertedWeeks,
      };

      return alternatingProgram;
    } else {
      if (phases.length === 0) {
        showError(t('program.advancedProgramMustHavePhase'));
        return null;
      }

      const convertedPhases = phases.map((phase) => {
        if (!phase.name.trim()) {
          throw new Error(t('program.allPhasesMustHaveName'));
        }

        if (phase.weeks.length === 0) {
          throw new Error(t('program.phaseMustHaveWeek', { name: phase.name }));
        }

        const dayLabels: ProgramDayLabel[] = [
          'Day1',
          'Day2',
          'Day3',
          'Day4',
          'Day5',
          'Day6',
          'Day7',
        ];
        const convertedWeeks = phase.weeks.map((week) => {
          const convertedDays = week.days.map((day, dayIndex) => {
            if (day === 'rest') {
              return 'rest' as const;
            }

            const exercises = day.exercises.map((ex) => {
              const sets = ex.sets
                .filter((set) => set.reps.trim() && set.rir.trim())
                .map((set) => ({
                  reps: Number(set.reps),
                  rir: Number(set.rir),
                }));

              if (sets.length === 0) {
                throw new Error(t('program.exerciseMustHaveValidSet', { name: ex.name }));
              }

              return {
                name: ex.name,
                id: ex.exerciseId,
                sets,
              };
            });

            return {
              name: dayLabels[dayIndex],
              exercises,
            };
          });

          return {
            days: convertedDays,
          };
        });

        return {
          name: phase.name.trim(),
          description: phase.description.trim(),
          weeks: convertedWeeks,
        };
      });

      const advancedProgram = {
        name: name.trim(),
        description: description.trim(),
        type: 'advanced' as const,
        phases: convertedPhases,
      };

      return advancedProgram;
    }
  }, [name, description, programType, weeks, alternatingWeeks, phases, showError, t]);

  return {
    validateAndConvert,
  };
}
