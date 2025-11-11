import {
  Firestore,
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
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
  date: Date | string;
  notes?: string;
  exercises: WorkoutExercise[];
};

export type Workout = {
  id: string;
  date: Date;
  notes: string;
  exercises: WorkoutExercise[];
  createdAt: Date;
  updatedAt: Date;
};

type WorkoutFirestoreData = {
  date: Timestamp;
  notes: string;
  exercises: WorkoutExercise[];
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
      createdAt: now,
      updatedAt: now,
    });

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

    const serialized = this.serializeWorkout(workout);

    await setDoc(workoutRef, {
      ...serialized,
      createdAt,
      updatedAt: Timestamp.now(),
    });
  }

  async getLatestWorkout(userId: string): Promise<Workout | null> {
    const workoutsCollection = collection(this.db, `users/${userId}/workouts`);
    const latestWorkoutQuery = query(workoutsCollection, orderBy('date', 'desc'), limit(1));
    const snapshot = await getDocs(latestWorkoutQuery);

    if (snapshot.empty) {
      return null;
    }

    const latestDoc = snapshot.docs[0];
    const data = latestDoc.data() as WorkoutFirestoreData;

    return {
      id: latestDoc.id,
      date: data.date.toDate(),
      notes: data.notes,
      exercises: data.exercises,
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
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  }

  private serializeWorkout(workout: WorkoutInput) {
    const date = typeof workout.date === 'string' ? new Date(workout.date) : workout.date;

    return {
      date: Timestamp.fromDate(date),
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
