export type ProgramSet = {
  reps: number;
  rir: number;
};

export type ProgramExercise = {
  name: string;
  id: string;
  isGlobal: boolean;
  sets: ProgramSet[];
};

export type ProgramDay =
  | {
      name: string;
      exercises: ProgramExercise[];
    }
  | 'rest';

export type ProgramWeek = { days: ProgramDay[] };

export type ProgramPhase = {
  name: string;
  description: string;
  weeks: ProgramWeek[];
};

export type SimpleProgramInput = {
  name: string;
  description: string;
  type: 'simple';
  week: ProgramWeek;
};

export type AlternatingProgramInput = {
  name: string;
  description: string;
  type: 'alternating';
  alternatingWeeks: [ProgramWeek, ProgramWeek];
};

export type AdvancedProgramInput = {
  name: string;
  description: string;
  type: 'advanced';
  phases: ProgramPhase[];
};

export type ProgramInput = SimpleProgramInput | AlternatingProgramInput | AdvancedProgramInput;

export type SimpleProgram = {
  id: string;
  name: string;
  description: string;
  type: 'simple';
  week: ProgramWeek;
  createdAt: Date;
  updatedAt: Date;
};

export type AlternatingProgram = {
  id: string;
  name: string;
  description: string;
  type: 'alternating';
  alternatingWeeks: [ProgramWeek, ProgramWeek];
  createdAt: Date;
  updatedAt: Date;
};

export type AdvancedProgram = {
  id: string;
  name: string;
  description: string;
  type: 'advanced';
  phases: ProgramPhase[];
  createdAt: Date;
  updatedAt: Date;
};

export type Program = SimpleProgram | AlternatingProgram | AdvancedProgram;
