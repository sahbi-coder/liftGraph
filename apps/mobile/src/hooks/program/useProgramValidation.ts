import { useCallback } from 'react';
import type { ProgramType, ProgramWeekForm, ProgramPhaseForm } from './useProgramForm/types';
import type { AlternatingWeeks, ProgramDayLabel } from '@/services';
import { ProgramInput } from '@/services';

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
  const validateAndConvert = useCallback((): null | ProgramInput => {
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

      // Check if week has at least one active day
      const hasActiveDays = week.days.some((day) => day !== 'rest');
      if (!hasActiveDays) {
        showError(t('program.weekMustHaveActiveDays'));
        return null;
      }

      // Check if all days have names and at least one exercise
      for (let dayIndex = 0; dayIndex < week.days.length; dayIndex++) {
        const day = week.days[dayIndex];
        if (day !== 'rest') {
          if (!day.name.trim()) {
            showError(t('program.dayNameRequired', { index: String(dayIndex + 1) }));
            return null;
          }
          if (day.exercises.length === 0) {
            showError(t('program.dayMustHaveExercise', { index: String(dayIndex + 1) }));
            return null;
          }
        }
      }

      const convertedDays = week.days.map((day, dayIndex) => {
        if (day === 'rest') {
          return 'rest' as const;
        }

        const exercises = day.exercises.map((ex) => {
          // Check that ALL sets are valid (reps > 0)
          const allSetsValid = ex.sets.every((set) => {
            const reps = set.reps.trim();
            const rir = set.rir.trim();
            // Both reps and rir must be non-empty and reps must be > 0
            return reps && rir && Number(reps) > 0;
          });

          if (!allSetsValid || ex.sets.length === 0) {
            showError(t('program.exerciseMustHaveValidSet', { name: ex.name }));
            return null;
          }

          // All sets are valid, so map them
          const sets = ex.sets.map((set) => ({
            reps: Number(set.reps),
            rir: Number(set.rir),
          }));

          return {
            name: ex.name,
            id: ex.exerciseId,
            sets,
          };
        });

        // Check if any exercise conversion failed
        if (exercises.some((ex) => ex === null)) {
          return null;
        }

        return {
          label: dayLabels[dayIndex],
          name: day.name.trim(),
          exercises: exercises.filter((ex): ex is NonNullable<typeof ex> => ex !== null),
        };
      });

      // Check if any day conversion failed
      if (convertedDays.some((day) => day === null)) {
        return null;
      }

      const convertedWeek = {
        days: convertedDays.filter((day): day is NonNullable<typeof day> => day !== null),
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
        // Check if week has at least one active day
        const hasActiveDays = week.days.some((day) => day !== 'rest');
        if (!hasActiveDays) {
          showError(t('program.weekMustHaveActiveDays'));
          return null;
        }

        // Check if all days have names and at least one exercise
        for (let dayIndex = 0; dayIndex < week.days.length; dayIndex++) {
          const day = week.days[dayIndex];
          if (day !== 'rest') {
            if (!day.name.trim()) {
              showError(t('program.dayNameRequired', { index: String(dayIndex + 1) }));
              return null;
            }
            if (day.exercises.length === 0) {
              showError(t('program.dayMustHaveExercise', { index: String(dayIndex + 1) }));
              return null;
            }
          }
        }

        const convertedDays = week.days.map((day, dayIndex) => {
          if (day === 'rest') {
            return 'rest' as const;
          }

          const exercises = day.exercises.map((ex) => {
            // Check that ALL sets are valid (reps > 0)
            const allSetsValid = ex.sets.every((set) => {
              const reps = set.reps.trim();
              const rir = set.rir.trim();
              // Both reps and rir must be non-empty and reps must be > 0
              return reps && rir && Number(reps) > 0;
            });

            if (!allSetsValid || ex.sets.length === 0) {
              showError(t('program.exerciseMustHaveValidSet', { name: ex.name }));
              return null;
            }

            // All sets are valid, so map them
            const sets = ex.sets.map((set) => ({
              reps: Number(set.reps),
              rir: Number(set.rir),
            }));

            return {
              name: ex.name,
              id: ex.exerciseId,
              sets,
            };
          });

          // Check if any exercise conversion failed
          if (exercises.some((ex) => ex === null)) {
            return null;
          }

          return {
            label: dayLabels[dayIndex],
            name: day.name.trim(),
            exercises: exercises.filter((ex): ex is NonNullable<typeof ex> => ex !== null),
          };
        });

        // Check if any day conversion failed
        if (convertedDays.some((day) => day === null)) {
          return null;
        }

        return {
          days: convertedDays.filter((day): day is NonNullable<typeof day> => day !== null),
        };
      };

      const week1 = convertWeek(alternatingWeeks[0]);
      if (!week1) {
        return null;
      }

      const week2 = convertWeek(alternatingWeeks[1]);
      if (!week2) {
        return null;
      }

      const convertedWeeks: AlternatingWeeks = [week1, week2];

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
          showError(t('program.allPhasesMustHaveName'));
          return null;
        }

        if (phase.weeks.length === 0) {
          showError(t('program.phaseMustHaveWeek', { name: phase.name }));
          return null;
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
          // Check if week has at least one active day
          const hasActiveDays = week.days.some((day) => day !== 'rest');
          if (!hasActiveDays) {
            showError(t('program.weekMustHaveActiveDays'));
            return null;
          }

          // Check if all days have names and at least one exercise
          for (let dayIndex = 0; dayIndex < week.days.length; dayIndex++) {
            const day = week.days[dayIndex];
            if (day !== 'rest') {
              if (!day.name.trim()) {
                showError(t('program.dayNameRequired', { index: String(dayIndex + 1) }));
                return null;
              }
              if (day.exercises.length === 0) {
                showError(t('program.dayMustHaveExercise', { index: String(dayIndex + 1) }));
                return null;
              }
            }
          }

          const convertedDays = week.days.map((day, dayIndex) => {
            if (day === 'rest') {
              return 'rest' as const;
            }

            const exercises = day.exercises.map((ex) => {
              // Check that ALL sets are valid (reps > 0)
              const allSetsValid = ex.sets.every((set) => {
                const reps = set.reps.trim();
                const rir = set.rir.trim();
                // Both reps and rir must be non-empty and reps must be > 0
                return reps && rir && Number(reps) > 0;
              });

              if (!allSetsValid || ex.sets.length === 0) {
                showError(t('program.exerciseMustHaveValidSet', { name: ex.name }));
                return null;
              }

              // All sets are valid, so map them
              const sets = ex.sets.map((set) => ({
                reps: Number(set.reps),
                rir: Number(set.rir),
              }));

              return {
                name: ex.name,
                id: ex.exerciseId,
                sets,
              };
            });

            // Check if any exercise conversion failed
            if (exercises.some((ex) => ex === null)) {
              return null;
            }

            return {
              label: dayLabels[dayIndex],
              name: day.name.trim(),
              exercises: exercises.filter((ex): ex is NonNullable<typeof ex> => ex !== null),
            };
          });

          // Check if any day conversion failed
          if (convertedDays.some((day) => day === null)) {
            return null;
          }

          return {
            name: week.name?.trim(),
            days: convertedDays.filter((day): day is NonNullable<typeof day> => day !== null),
          };
        });

        // Check if any week conversion failed
        if (convertedWeeks.some((week) => week === null)) {
          return null;
        }

        return {
          name: phase.name.trim(),
          description: phase.description.trim(),
          weeks: convertedWeeks.filter((week): week is NonNullable<typeof week> => week !== null),
        };
      });

      // Check if any phase conversion failed
      if (convertedPhases.some((phase) => phase === null)) {
        return null;
      }

      const advancedProgram = {
        name: name.trim(),
        description: description.trim(),
        type: 'advanced' as const,
        phases: convertedPhases.filter(
          (phase): phase is NonNullable<typeof phase> => phase !== null,
        ),
      };

      return advancedProgram;
    }
  }, [name, description, programType, weeks, alternatingWeeks, phases, showError, t]);

  return {
    validateAndConvert,
  };
}
