import { Firestore } from 'firebase/firestore';
import type { UserProfile, WorkoutInput, ProgramInput } from '@/domain';
// Service classes
import { UserProfileService } from './user-profile';
import { ExercisesService } from './exercises';
import { WorkoutsService } from './workouts';
import { ProgramsService } from './programs';

export class FirestoreService {
  public readonly userProfile: UserProfileService;
  public readonly exercises: ExercisesService;
  public readonly workouts: WorkoutsService;
  public readonly programs: ProgramsService;

  constructor(private readonly db: Firestore) {
    this.userProfile = new UserProfileService(db);
    this.exercises = new ExercisesService(db);
    this.workouts = new WorkoutsService(db);
    this.programs = new ProgramsService(db);
  }

  // User Profile methods (delegated)
  async createUserProfile(uid: string, data: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>) {
    return this.userProfile.createUserProfile(uid, data);
  }

  async getUserProfile(uid: string) {
    return this.userProfile.getUserProfile(uid);
  }

  async updateUserProfile(uid: string, data: Partial<UserProfile>) {
    return this.userProfile.updateUserProfile(uid, data);
  }

  // Exercise methods (delegated)
  async getUserExercises(userId: string, language: string) {
    return this.exercises.getUserExercises(userId, language);
  }

  async createExercise(
    userId: string,
    language: string,
    exercise: {
      name: string;
      category: string;
      bodyPart: string;
      allowedUnits: string[];
      description?: string;
    },
  ): Promise<string> {
    return this.exercises.createExercise(userId, language, exercise);
  }

  async updateExercise(
    userId: string,
    exerciseId: string,
    language: string,
    exercise: {
      name: string;
      category: string;
      bodyPart: string;
      allowedUnits: string[];
      description?: string;
    },
  ) {
    return this.exercises.updateExercise(userId, language, exerciseId, exercise);
  }

  async getExercise(userId: string, exerciseId: string, language: string) {
    return this.exercises.getExercise(userId, exerciseId, language);
  }

  async syncExercisesFromLanguage(userId: string, oldLanguage: string, newLanguage: string) {
    return this.exercises.syncExercisesFromLanguage(userId, oldLanguage, newLanguage);
  }

  // Workout methods (delegated)
  async createWorkout(userId: string, workout: WorkoutInput) {
    return this.workouts.createWorkout(userId, workout);
  }

  async updateWorkout(userId: string, workoutId: string, workout: WorkoutInput) {
    return this.workouts.updateWorkout(userId, workoutId, workout);
  }

  async validateWorkout(userId: string, workoutId: string) {
    return this.workouts.validateWorkout(userId, workoutId);
  }

  async unvalidateWorkout(userId: string, workoutId: string) {
    return this.workouts.unvalidateWorkout(userId, workoutId);
  }

  async deleteWorkout(userId: string, workoutId: string) {
    return this.workouts.deleteWorkout(userId, workoutId);
  }

  async getLatestValidatedWorkout(userId: string) {
    return this.workouts.getLatestValidatedWorkout(userId);
  }

  async getEarliestNonValidatedFutureWorkout(userId: string) {
    return this.workouts.getEarliestNonValidatedFutureWorkout(userId);
  }

  async getTodaysWorkout(userId: string) {
    return this.workouts.getTodaysWorkout(userId);
  }

  async getWorkout(userId: string, workoutId: string) {
    return this.workouts.getWorkout(userId, workoutId);
  }

  async getWorkouts(userId: string) {
    return this.workouts.getWorkouts(userId);
  }

  // Program methods (delegated)
  async createProgram(userId: string, program: ProgramInput) {
    return this.programs.createProgram(userId, program);
  }

  async getPrograms(userId: string) {
    return this.programs.getPrograms(userId);
  }

  async getProgram(userId: string, programId: string) {
    return this.programs.getProgram(userId, programId);
  }

  async updateProgram(userId: string, programId: string, program: ProgramInput) {
    return this.programs.updateProgram(userId, programId, program);
  }

  async deleteProgram(userId: string, programId: string) {
    return this.programs.deleteProgram(userId, programId);
  }
}
