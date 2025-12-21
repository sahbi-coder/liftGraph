import type { Program, ProgramDayLabel } from '@/services';
import type {
  ProgramWeekForm,
  ProgramPhaseForm,
  ProgramDayForm,
  ProgramExerciseForm,
  ProgramSetForm,
} from '../../program/useProgramForm/types';

import { createWeekForm, createPhaseForm } from '../../program/useProgramForm/types';

const dayLabels: ProgramDayLabel[] = ['Day1', 'Day2', 'Day3', 'Day4', 'Day5', 'Day6', 'Day7'];

function convertSetToForm(set: { reps: number; rir: number }): ProgramSetForm {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    reps: String(set.reps),
    rir: String(set.rir),
  };
}

function convertExerciseToForm(exercise: {
  id: string;
  name: string;
  sets: { reps: number; rir: number }[];
}): ProgramExerciseForm {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    exerciseId: exercise.id,
    name: exercise.name,
    sets: exercise.sets.map(convertSetToForm),
  };
}

function convertDayToForm(
  day: 'rest' | { label: string; name: string; exercises: any[] },
  index: number,
): 'rest' | ProgramDayForm {
  if (day === 'rest') return 'rest';

  return {
    name: day.name,
    exercises: day.exercises.map(convertExerciseToForm),
  };
}

function convertWeekToForm(week: { name?: string; days: any[] }): ProgramWeekForm {
  const weekForm = createWeekForm(week.name || '');

  // Convert days
  weekForm.days = week.days.map((day, index) => convertDayToForm(day, index));

  // Set selected days
  weekForm.selectedDays = week.days
    .map((day, index) => (day !== 'rest' ? dayLabels[index] : null))
    .filter((day): day is (typeof dayLabels)[number] => day !== null);

  return weekForm;
}

function convertPhaseToForm(phase: {
  name: string;
  description: string;
  weeks: any[];
}): ProgramPhaseForm {
  const phaseForm = createPhaseForm(phase.name, phase.description);
  phaseForm.weeks = phase.weeks.map(convertWeekToForm);
  return phaseForm;
}

export function convertProgramToForm(program: Program): {
  programType: 'simple' | 'alternating' | 'advanced';
  name: string;
  description: string;
  weeks: ProgramWeekForm[];
  alternatingWeeks: [ProgramWeekForm, ProgramWeekForm] | null;
  phases: ProgramPhaseForm[];
} {
  if (program.type === 'simple') {
    return {
      programType: 'simple',
      name: program.name,
      description: program.description,
      weeks: [convertWeekToForm(program.week)],
      alternatingWeeks: null,
      phases: [],
    };
  } else if (program.type === 'alternating') {
    return {
      programType: 'alternating',
      name: program.name,
      description: program.description,
      weeks: [],
      alternatingWeeks: [
        convertWeekToForm(program.alternatingWeeks[0]),
        convertWeekToForm(program.alternatingWeeks[1]),
      ],
      phases: [],
    };
  } else {
    return {
      programType: 'advanced',
      name: program.name,
      description: program.description,
      weeks: [],
      alternatingWeeks: null,
      phases: program.phases.map(convertPhaseToForm),
    };
  }
}
