// Re-export domain types for backward compatibility during migration
export type {
  UserPreferences,
  UserProfile,
  Exercise,
  WorkoutSet,
  WorkoutExercise,
  WorkoutInput,
  Workout,
  ProgramSet,
  ProgramExercise,
  ProgramDay,
  ProgramWeek,
  ProgramPhase,
  SimpleProgramInput,
  AlternatingProgramInput,
  AdvancedProgramInput,
  ProgramInput,
  SimpleProgram,
  AlternatingProgram,
  AdvancedProgram,
  Program,
} from '@/domain';

// Re-export services
export { FirestoreService } from './firestore';
export { UserProfileService } from './user-profile';
export { ExercisesService } from './exercises';
export { WorkoutsService } from './workouts';
export { ProgramsService } from './programs';
