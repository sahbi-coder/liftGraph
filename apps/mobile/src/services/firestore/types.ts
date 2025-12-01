import { Timestamp } from 'firebase/firestore';
import type { WorkoutExercise, ProgramWeek, ProgramPhase } from '@/domain';

// Firestore-specific types for internal service use
// These types represent how data is stored in Firestore (with Timestamps, etc.)

export type ExerciseFirestoreData = {
  name: string;
  category: string;
  bodyPart: string;
  description?: string;
  createdAt?: Timestamp | Date;
  [key: string]: unknown;
};

export type WorkoutFirestoreData = {
  date: Timestamp;
  notes: string;
  exercises: WorkoutExercise[];
  validated: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ProgramFirestoreData = {
  name: string;
  description: string;
  type: 'simple' | 'alternating' | 'advanced';
  week?: ProgramWeek;
  alternatingWeeks?: [ProgramWeek, ProgramWeek];
  phases?: ProgramPhase[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
