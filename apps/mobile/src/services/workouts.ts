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
} from 'firebase/firestore';
import type { WorkoutInput, Workout } from '@/domain';
import { WorkoutSchema, WorkoutInputSchema } from '@/domain';

export class WorkoutsService {
  constructor(private readonly db: Firestore) {}

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
