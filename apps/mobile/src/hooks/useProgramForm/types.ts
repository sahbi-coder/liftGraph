import type { ProgramSet, ProgramDayLabel } from '@/services';
import type { ExerciseSelection } from '@/types/workout';

export type ProgramType = 'simple' | 'alternating' | 'advanced';

export type ProgramSetForm = {
  id: string;
  reps: string;
  rir: string;
};

export type ProgramExerciseForm = {
  id: string;
  exerciseId: string;
  name: string;
  sets: ProgramSetForm[];
};

export type ProgramDayForm = {
  name: string;
  exercises: ProgramExerciseForm[];
};

export type ProgramWeekForm = {
  id: string;
  name: string;
  days: ('rest' | ProgramDayForm)[];
  selectedDays: ProgramDayLabel[];
};

export type ProgramPhaseForm = {
  id: string;
  name: string;
  description: string;
  weeks: ProgramWeekForm[];
};

export const createSetForm = (set?: ProgramSet): ProgramSetForm => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  reps: set ? String(set.reps) : '0',
  rir: set ? String(set.rir) : '0',
});

export const createExerciseForm = (exercise: ExerciseSelection): ProgramExerciseForm => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  exerciseId: exercise.id,
  name: exercise.name,
  sets: [createSetForm()],
});

export const createWeekForm = (name: string = ''): ProgramWeekForm => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name,
  days: ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest'],
  selectedDays: [],
});

export const createPhaseForm = (name: string = '', description: string = ''): ProgramPhaseForm => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name,
  description,
  weeks: [],
});
