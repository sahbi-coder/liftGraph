import {
  Firestore,
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Exercise = {
  id: string;
  name: string;
  category: string;
  bodyPart: string;
  description?: string;
  createdAt?: Date;
  source: 'library' | 'user';
};

type ExerciseFirestoreData = {
  name: string;
  category: string;
  bodyPart: string;
  description?: string;
  createdAt?: Timestamp | Date;
  [key: string]: unknown;
};

export type WorkoutSet = {
  weight: number;
  reps: number;
  rir: number;
};

export type WorkoutExercise = {
  exerciseId: string;
  exerciseOwnerId: string | null;
  name: string;
  order: number;
  sets: WorkoutSet[];
};

export type WorkoutInput = {
  date: Date;
  notes?: string;
  exercises: WorkoutExercise[];
};

export type Workout = {
  id: string;
  date: Date;
  notes: string;
  exercises: WorkoutExercise[];
  validated: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type WorkoutFirestoreData = {
  date: Timestamp;
  notes: string;
  exercises: WorkoutExercise[];
  validated: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ProgramSet = {
  reps: number;
  rpe: number;
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

export type AdvancedProgramInput = {
  name: string;
  description: string;
  type: 'advanced';
  phases: ProgramPhase[];
};

export type ProgramInput = SimpleProgramInput | AdvancedProgramInput;

export type SimpleProgram = {
  id: string;
  name: string;
  description: string;
  type: 'simple';
  week: ProgramWeek;
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

export type Program = SimpleProgram | AdvancedProgram;

type ProgramFirestoreData = {
  name: string;
  description: string;
  type: 'simple' | 'advanced';
  week?: ProgramWeek;
  phases?: ProgramPhase[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export class FirestoreService {
  constructor(private readonly db: Firestore) {}

  async createUserProfile(uid: string, data: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>) {
    const userRef = doc(this.db, 'users', uid);
    const now = Timestamp.now().toDate();

    await setDoc(userRef, {
      ...data,
      uid,
      createdAt: now,
      updatedAt: now,
    });
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(this.db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const data = userSnap.data();
    return {
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as UserProfile;
  }

  async updateUserProfile(uid: string, data: Partial<UserProfile>) {
    const userRef = doc(this.db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: Timestamp.now().toDate(),
    });
  }

  async getExercisesWithLibrary(userId: string): Promise<Exercise[]> {
    const librarySnapshot = await getDocs(collection(this.db, 'exercisesLibrary'));
    const libraryExercises: Exercise[] = librarySnapshot.docs.map((docSnap) => {
      const data = docSnap.data() as ExerciseFirestoreData;
      return {
        id: docSnap.id,
        name: data.name,
        category: data.category,
        bodyPart: data.bodyPart ?? (data.body_part as string | undefined),
        description: data.description,
        source: 'library',
      };
    });

    const userSnapshot = await getDocs(collection(this.db, `users/${userId}/exercises`));
    const userExercises: Exercise[] = userSnapshot.docs.map((docSnap) => {
      const data = docSnap.data() as ExerciseFirestoreData;
      const createdAtValue = data.createdAt;

      return {
        id: docSnap.id,
        name: data.name,
        category: data.category,
        bodyPart: data.bodyPart,
        description: data.description,
        createdAt:
          createdAtValue instanceof Timestamp
            ? createdAtValue.toDate()
            : (createdAtValue as Date | undefined),
        source: 'user',
      };
    });

    return [...libraryExercises, ...userExercises];
  }

  async createWorkout(userId: string, workout: WorkoutInput): Promise<string> {
    const workoutsCollection = collection(this.db, `users/${userId}/workouts`);
    const now = Timestamp.now();
    const serialized = this.serializeWorkout(workout);
    const docRef = await addDoc(workoutsCollection, {
      ...serialized,
      validated: false,
      createdAt: now,
      updatedAt: now,
    });

    return docRef.id;
  }

  async createProgram(userId: string, program: ProgramInput): Promise<string> {
    const programsCollection = collection(this.db, `users/${userId}/programs`);
    const now = Timestamp.now();

    const programData: ProgramFirestoreData = {
      name: program.name,
      description: program.description,
      type: program.type,
      createdAt: now,
      updatedAt: now,
    };

    if (program.type === 'simple') {
      programData.week = program.week;
    } else {
      programData.phases = program.phases;
    }

    const docRef = await addDoc(programsCollection, programData);

    return docRef.id;
  }

  async updateWorkout(userId: string, workoutId: string, workout: WorkoutInput): Promise<void> {
    const workoutRef = doc(this.db, `users/${userId}/workouts/${workoutId}`);
    const existingWorkout = await getDoc(workoutRef);

    if (!existingWorkout.exists()) {
      throw new Error('Workout not found');
    }

    const existingData = existingWorkout.data() as Partial<WorkoutFirestoreData>;
    const createdAt =
      existingData?.createdAt instanceof Timestamp ? existingData.createdAt : Timestamp.now();
    const validated = existingData?.validated ?? false;

    const serialized = this.serializeWorkout(workout);

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

  async getLatestValidatedWorkout(userId: string): Promise<Workout | null> {
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

    return {
      id: latestDoc.id,
      date: data.date.toDate(),
      notes: data.notes,
      exercises: data.exercises,
      validated: data.validated ?? false,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  }

  async getEarliestNonValidatedFutureWorkout(userId: string): Promise<Workout | null> {
    const workoutsCollection = collection(this.db, `users/${userId}/workouts`);
    // Get today at midnight in UTC
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    console.log('Today UTC midnight:', today.toISOString());

    // Query all workouts, then filter in memory
    const futureWorkoutQuery = query(workoutsCollection, orderBy('date', 'asc'));
    const snapshot = await getDocs(futureWorkoutQuery);

    console.log('Query results count:', snapshot.size);

    // Filter results to only include non-validated workouts dated today or in the future
    // Compare at day level using UTC time
    const filteredDocs = snapshot.docs.filter((doc) => {
      const data = doc.data() as WorkoutFirestoreData;

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
      console.log('Workout date UTC:', workoutDateUTC.toISOString());
      console.log('Today:', today.toISOString());
      const isTodayOrFuture = workoutDateUTC >= today;

      console.log('Workout date check:', {
        id: doc.id,
        workoutDate: workoutDate.toISOString(),
        workoutDateUTC: workoutDateUTC.toISOString(),
        todayUTC: today.toISOString(),
        isTodayOrFuture,
        validated: data.validated,
      });

      return isTodayOrFuture;
    });

    if (filteredDocs.length === 0) {
      console.log('No non-validated workouts found that are today or in the future');
      return null;
    }

    // Get the earliest one (first in the filtered array since query is ordered)
    const earliestDoc = filteredDocs[0];
    const data = earliestDoc.data() as WorkoutFirestoreData;

    return {
      id: earliestDoc.id,
      date: data.date.toDate(),
      notes: data.notes,
      exercises: data.exercises,
      validated: data.validated ?? false,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  }

  async getTodaysWorkout(userId: string): Promise<Workout | null> {
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
      const data = doc.data() as WorkoutFirestoreData;
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
      const data = doc.data() as WorkoutFirestoreData;
      return data.validated === false;
    });

    const workoutDoc = nonValidated || todaysWorkouts[0];
    const data = workoutDoc.data() as WorkoutFirestoreData;

    return {
      id: workoutDoc.id,
      date: data.date.toDate(),
      notes: data.notes,
      exercises: data.exercises,
      validated: data.validated ?? false,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  }

  async getWorkout(userId: string, workoutId: string): Promise<Workout | null> {
    const workoutRef = doc(this.db, `users/${userId}/workouts/${workoutId}`);
    const snapshot = await getDoc(workoutRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data() as WorkoutFirestoreData;

    return {
      id: snapshot.id,
      date: data.date.toDate(),
      notes: data.notes,
      exercises: data.exercises,
      validated: data.validated ?? false,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  }

  private serializeWorkout(workout: WorkoutInput) {
    const date = typeof workout.date === 'string' ? new Date(workout.date) : workout.date;

    const utcMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

    return {
      date: Timestamp.fromDate(utcMidnight),
      notes: workout.notes ?? '',
      exercises: workout.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        exerciseOwnerId: exercise.exerciseOwnerId ?? null,
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
