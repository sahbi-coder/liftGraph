import {
  Firestore,
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

// Domain models - types
import type {
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

// Domain models - schemas for validation
import {
  UserProfileSchema,
  UserPreferencesSchema,
  ExerciseSchema,
  WorkoutSchema,
  WorkoutInputSchema,
  ProgramSchema,
  ProgramInputSchema,
} from '@/domain';

// Firestore-specific types (internal use only)
import type { ProgramFirestoreData } from './firestore-types';

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
};

export class FirestoreService {
  constructor(private readonly db: Firestore) {}

  async createUserProfile(uid: string, data: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>) {
    // Validate preferences if provided
    if (data.preferences) {
      const preferencesResult = UserPreferencesSchema.safeParse(data.preferences);
      if (!preferencesResult.success) {
        throw new Error(`Invalid user preferences: ${preferencesResult.error.message}`);
      }
    }

    const userRef = doc(this.db, 'users', uid);
    const now = Timestamp.now().toDate();

    await setDoc(userRef, {
      ...data,
      uid,
      createdAt: now,
      updatedAt: now,
    });
  }

  async getUserProfile(uid: string) {
    const userRef = doc(this.db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const data = userSnap.data();
    const profileData = {
      uid,
      email: data.email,
      displayName: data.displayName,
      preferences: data.preferences,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };

    // Validate with schema
    const result = UserProfileSchema.safeParse(profileData);
    if (!result.success) {
      console.error('Invalid user profile from Firestore:', result.error);
      throw new Error(`Invalid user profile data: ${result.error.message}`);
    }

    return result.data;
  }

  async updateUserProfile(uid: string, data: Partial<UserProfile>) {
    const userRef = doc(this.db, 'users', uid);
    const updateData = {
      ...data,
      updatedAt: Timestamp.now().toDate(),
    };
    await updateDoc(userRef, updateData);
  }

  async getUserExercises(userId: string) {
    const userExercisesRef = collection(this.db, `users/${userId}/exercises`);
    const userSnapshot = await getDocs(userExercisesRef);

    // If user exercises exist, return them
    if (!userSnapshot.empty) {
      return userSnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const result = ExerciseSchema.safeParse({
          id: docSnap.id,
          name: data.name,
          category: data.category,
          bodyPart: data.bodyPart,
          description: data.description,
        });

        if (!result.success) {
          throw new Error(`Invalid user exercise (${docSnap.id}): ${result.error.message}`);
        }
        return result.data;
      });
    }

    // If user exercises don't exist, fetch from library and copy to user's collection
    const librarySnapshot = await getDocs(collection(this.db, 'exercisesLibrary'));
    const libraryExercises = librarySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const result = ExerciseSchema.safeParse({
        id: docSnap.id,
        name: data.name,
        category: data.category,
        bodyPart: data.bodyPart,
        description: data.description,
      });

      if (!result.success) {
        throw new Error(`Invalid library exercise (${docSnap.id}): ${result.error.message}`);
      }
      return result.data;
    });

    // Copy library exercises to user's collection using batch write
    if (libraryExercises.length > 0) {
      const batch = writeBatch(this.db);
      for (const exercise of libraryExercises) {
        batch.set(doc(this.db, `users/${userId}/exercises`, exercise.id), {
          name: exercise.name,
          category: exercise.category,
          bodyPart: exercise.bodyPart,
          description: exercise.description,
        });
      }
      await batch.commit();
    }

    return libraryExercises;
  }

  async createExercise(
    userId: string,
    exercise: {
      name: string;
      category: string;
      bodyPart: string;
      description?: string;
    },
  ): Promise<string> {
    // Generate ID from name: lowercase with spaces replaced by hyphens
    const exerciseId = exercise.name.trim().toLowerCase().replace(/\s+/g, '-');

    // Check if exercise with this ID exists in user's exercises
    const userExerciseRef = doc(this.db, `users/${userId}/exercises`, exerciseId);
    const userExerciseDoc = await getDoc(userExerciseRef);

    if (userExerciseDoc.exists()) {
      throw new Error(
        `An exercise with the name "${exercise.name}" already exists in your exercises.`,
      );
    }

    // Create the exercise with the generated ID

    await setDoc(userExerciseRef, {
      name: exercise.name.trim(),
      category: exercise.category.trim(),
      bodyPart: exercise.bodyPart.trim(),
      description: exercise.description?.trim(),
    });

    return exerciseId;
  }

  async createWorkout(userId: string, workout: WorkoutInput) {
    // Validate input with schema
    const inputResult = WorkoutInputSchema.safeParse(workout);
    if (!inputResult.success) {
      throw new Error(`Invalid workout input: ${inputResult.error.message}`);
    }

    const workoutsCollection = collection(this.db, `users/${userId}/workouts`);
    const now = Timestamp.now();
    const serialized = this.serializeWorkout(inputResult.data);
    const docRef = await addDoc(workoutsCollection, {
      ...serialized,
      validated: false,
      createdAt: now,
      updatedAt: now,
    });

    return docRef.id;
  }

  async createProgram(userId: string, program: ProgramInput) {
    // Validate input with schema
    const inputResult = ProgramInputSchema.safeParse(program);
    if (!inputResult.success) {
      throw new Error(`Invalid program input: ${inputResult.error.message}`);
    }

    const programsCollection = collection(this.db, `users/${userId}/programs`);
    const now = Timestamp.now();

    const programData: ProgramFirestoreData = {
      name: inputResult.data.name,
      description: inputResult.data.description,
      type: inputResult.data.type,
      createdAt: now,
      updatedAt: now,
    };

    if (inputResult.data.type === 'simple') {
      programData.week = inputResult.data.week;
    } else if (inputResult.data.type === 'alternating') {
      programData.alternatingWeeks = inputResult.data.alternatingWeeks;
    } else {
      programData.phases = inputResult.data.phases;
    }

    const docRef = await addDoc(programsCollection, programData);

    return docRef.id;
  }

  async getPrograms(userId: string) {
    const programsCollection = collection(this.db, `users/${userId}/programs`);
    const programsQuery = query(programsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(programsQuery);

    const programs = snapshot.docs
      .map((docSnap) => {
        const data = docSnap.data();
        const baseProgram = {
          id: docSnap.id,
          name: data.name,
          description: data.description,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        };

        let programData: Program;
        if (data.type === 'simple') {
          if (!data.week) {
            console.error(`Invalid simple program (${docSnap.id}): missing week`);
            return null;
          }
          programData = {
            ...baseProgram,
            type: 'simple',
            week: data.week,
          };
        } else if (data.type === 'alternating') {
          if (!data.alternatingWeeks) {
            console.error(`Invalid alternating program (${docSnap.id}): missing alternatingWeeks`);
            return null;
          }
          programData = {
            ...baseProgram,
            type: 'alternating',
            alternatingWeeks: data.alternatingWeeks,
          };
        } else {
          if (!data.phases) {
            console.error(`Invalid advanced program (${docSnap.id}): missing phases`);
            return null;
          }
          programData = {
            ...baseProgram,
            type: 'advanced',
            phases: data.phases,
          };
        }

        // Validate with schema
        const result = ProgramSchema.safeParse(programData);
        if (!result.success) {
          console.error(`Invalid program (${docSnap.id}):`, result.error);
          return null;
        }
        return result.data;
      })
      .filter((program): program is Program => program !== null);

    return programs;
  }

  async getProgram(userId: string, programId: string) {
    const programRef = doc(this.db, `users/${userId}/programs/${programId}`);
    const snapshot = await getDoc(programRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    const baseProgram = {
      id: snapshot.id,
      name: data.name,
      description: data.description,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };

    let programData: Program;
    if (data.type === 'simple') {
      if (!data.week) {
        throw new Error(`Invalid simple program: missing week`);
      }
      programData = {
        ...baseProgram,
        type: 'simple',
        week: data.week,
      };
    } else if (data.type === 'alternating') {
      if (!data.alternatingWeeks) {
        throw new Error(`Invalid alternating program: missing alternatingWeeks`);
      }
      programData = {
        ...baseProgram,
        type: 'alternating',
        alternatingWeeks: data.alternatingWeeks,
      };
    } else {
      if (!data.phases) {
        throw new Error(`Invalid advanced program: missing phases`);
      }
      programData = {
        ...baseProgram,
        type: 'advanced',
        phases: data.phases,
      };
    }

    // Validate with schema
    const result = ProgramSchema.safeParse(programData);
    if (!result.success) {
      console.error('Invalid program from Firestore:', result.error);
      throw new Error(`Invalid program data: ${result.error.message}`);
    }

    return result.data;
  }

  async deleteProgram(userId: string, programId: string): Promise<void> {
    const programRef = doc(this.db, `users/${userId}/programs/${programId}`);
    const existingProgram = await getDoc(programRef);

    if (!existingProgram.exists()) {
      throw new Error('Program not found');
    }

    await deleteDoc(programRef);
  }

  async updateWorkout(userId: string, workoutId: string, workout: WorkoutInput) {
    // Validate input with schema
    const inputResult = WorkoutInputSchema.safeParse(workout);
    if (!inputResult.success) {
      throw new Error(`Invalid workout input: ${inputResult.error.message}`);
    }

    const workoutRef = doc(this.db, `users/${userId}/workouts/${workoutId}`);
    const existingWorkout = await getDoc(workoutRef);

    if (!existingWorkout.exists()) {
      throw new Error('Workout not found');
    }

    const existingData = existingWorkout.data();
    const createdAt =
      existingData?.createdAt instanceof Timestamp ? existingData.createdAt : Timestamp.now();
    const validated = existingData?.validated ?? false;

    const serialized = this.serializeWorkout(inputResult.data);

    await setDoc(workoutRef, {
      ...serialized,
      validated,
      createdAt,
      updatedAt: Timestamp.now(),
    });
  }

  async validateWorkout(userId: string, workoutId: string): Promise<void> {
    const workoutRef = doc(this.db, `users/${userId}/workouts/${workoutId}`);
    const existingWorkout = await getDoc(workoutRef);

    if (!existingWorkout.exists()) {
      throw new Error('Workout not found');
    }

    await updateDoc(workoutRef, {
      validated: true,
      updatedAt: Timestamp.now(),
    });
  }

  async unvalidateWorkout(userId: string, workoutId: string): Promise<void> {
    const workoutRef = doc(this.db, `users/${userId}/workouts/${workoutId}`);
    const existingWorkout = await getDoc(workoutRef);

    if (!existingWorkout.exists()) {
      throw new Error('Workout not found');
    }

    await updateDoc(workoutRef, {
      validated: false,
      updatedAt: Timestamp.now(),
    });
  }

  async deleteWorkout(userId: string, workoutId: string): Promise<void> {
    const workoutRef = doc(this.db, `users/${userId}/workouts/${workoutId}`);
    const existingWorkout = await getDoc(workoutRef);

    if (!existingWorkout.exists()) {
      throw new Error('Workout not found');
    }

    await deleteDoc(workoutRef);
  }

  async getLatestValidatedWorkout(userId: string) {
    const workoutsCollection = collection(this.db, `users/${userId}/workouts`);

    // Query validated workouts without orderBy to avoid composite index requirement
    // We'll sort in memory instead
    const latestWorkoutQuery = query(workoutsCollection, where('validated', '==', true));
    const snapshot = await getDocs(latestWorkoutQuery);

    if (snapshot.empty) {
      return null;
    }

    // Sort by date descending in memory and get the latest one
    const sortedDocs = snapshot.docs.sort((a, b) => {
      const aData = a.data();
      const bData = b.data();
      // Compare Timestamps - descending order (newest first)
      return bData.date.toMillis() - aData.date.toMillis();
    });

    const latestDoc = sortedDocs[0];
    const data = latestDoc.data();
    const workoutData = {
      id: latestDoc.id,
      date: data.date.toDate(),
      notes: data.notes,
      exercises: data.exercises,
      validated: data.validated ?? false,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };

    // Validate with schema
    const result = WorkoutSchema.safeParse(workoutData);
    if (!result.success) {
      console.error('Invalid workout from Firestore:', result.error);
      throw new Error(`Invalid workout data: ${result.error.message}`);
    }

    return result.data;
  }

  async getEarliestNonValidatedFutureWorkout(userId: string) {
    const workoutsCollection = collection(this.db, `users/${userId}/workouts`);
    // Get today at midnight in UTC
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    // Query all workouts, then filter in memory
    const futureWorkoutQuery = query(workoutsCollection, orderBy('date', 'asc'));
    const snapshot = await getDocs(futureWorkoutQuery);

    // Filter results to only include non-validated workouts dated today or in the future
    // Compare at day level using UTC time
    const filteredDocs = snapshot.docs.filter((doc) => {
      const data = doc.data();

      // Skip validated workouts
      if (data.validated === true) {
        return false;
      }

      const workoutDate = data.date.toDate();
      // Normalize workout date to UTC midnight for day-level comparison
      const workoutDateUTC = new Date(
        workoutDate.getFullYear(),
        workoutDate.getMonth(),
        workoutDate.getDate(),
        0,
        0,
        0,
        0,
      );
      const isTodayOrFuture = workoutDateUTC >= today;

      return isTodayOrFuture;
    });

    if (filteredDocs.length === 0) {
      return null;
    }

    // Get the earliest one (first in the filtered array since query is ordered)
    const earliestDoc = filteredDocs[0];
    const data = earliestDoc.data();
    const workoutData = {
      id: earliestDoc.id,
      date: data.date.toDate(),
      notes: data.notes,
      exercises: data.exercises,
      validated: data.validated ?? false,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };

    // Validate with schema
    const result = WorkoutSchema.safeParse(workoutData);
    if (!result.success) {
      console.error('Invalid workout from Firestore:', result.error);
      throw new Error(`Invalid workout data: ${result.error.message}`);
    }

    return result.data;
  }

  async getTodaysWorkout(userId: string) {
    const workoutsCollection = collection(this.db, `users/${userId}/workouts`);
    // Get today at midnight in local time
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Query all workouts, then filter in memory
    const workoutsQuery = query(workoutsCollection);
    const snapshot = await getDocs(workoutsQuery);

    // Filter to find workouts dated today
    const todaysWorkouts = snapshot.docs.filter((doc) => {
      const data = doc.data();
      const workoutDate = data.date.toDate();
      // Normalize workout date to local midnight for day-level comparison
      const workoutDateLocal = new Date(
        workoutDate.getFullYear(),
        workoutDate.getMonth(),
        workoutDate.getDate(),
        0,
        0,
        0,
        0,
      );
      return workoutDateLocal >= today && workoutDateLocal < tomorrow;
    });

    if (todaysWorkouts.length === 0) {
      return null;
    }

    // Prioritize non-validated workouts (scheduled for today), otherwise return validated
    const nonValidated = todaysWorkouts.find((doc) => {
      const data = doc.data();
      return data.validated === false;
    });

    const workoutDoc = nonValidated || todaysWorkouts[0];
    const data = workoutDoc.data();
    const workoutData = {
      id: workoutDoc.id,
      date: data.date.toDate(),
      notes: data.notes,
      exercises: data.exercises,
      validated: data.validated ?? false,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };

    // Validate with schema
    const result = WorkoutSchema.safeParse(workoutData);
    if (!result.success) {
      console.error('Invalid workout from Firestore:', result.error);
      throw new Error(`Invalid workout data: ${result.error.message}`);
    }

    return result.data;
  }

  async getWorkout(userId: string, workoutId: string) {
    const workoutRef = doc(this.db, `users/${userId}/workouts/${workoutId}`);
    const snapshot = await getDoc(workoutRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    const workoutData = {
      id: snapshot.id,
      date: data.date.toDate(),
      notes: data.notes,
      exercises: data.exercises,
      validated: data.validated ?? false,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };

    // Validate with schema
    const result = WorkoutSchema.safeParse(workoutData);
    if (!result.success) {
      console.error('Invalid workout from Firestore:', result.error);
      throw new Error(`Invalid workout data: ${result.error.message}`);
    }

    return result.data;
  }

  async getWorkouts(userId: string) {
    const workoutsCollection = collection(this.db, `users/${userId}/workouts`);
    const workoutsQuery = query(workoutsCollection, orderBy('date', 'desc'));
    const snapshot = await getDocs(workoutsQuery);

    const workouts = snapshot.docs
      .map((docSnap) => {
        const data = docSnap.data();
        const workoutData = {
          id: docSnap.id,
          date: data.date.toDate(),
          notes: data.notes,
          exercises: data.exercises,
          validated: data.validated ?? false,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        };

        // Validate with schema
        const result = WorkoutSchema.safeParse(workoutData);
        if (!result.success) {
          console.error(`Invalid workout (${docSnap.id}):`, result.error);
          return null;
        }
        return result.data;
      })
      .filter((workout): workout is Workout => workout !== null);

    return workouts;
  }

  private serializeWorkout(workout: WorkoutInput) {
    const date = typeof workout.date === 'string' ? new Date(workout.date) : workout.date;

    const utcMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

    return {
      date: Timestamp.fromDate(utcMidnight),
      notes: workout.notes ?? '',
      exercises: workout.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,

        name: exercise.name,
        order: exercise.order,
        sets: exercise.sets.map((set) => ({
          weight: set.weight,
          reps: set.reps,
          rir: set.rir,
        })),
      })),
    };
  }
}
