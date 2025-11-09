import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

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
  category?: string;
  bodyPart?: string;
  description?: string;
  createdAt?: Date;
  source: 'library' | 'user';
};

type ExerciseFirestoreData = {
  name: string;
  category?: string;
  bodyPart?: string;
  description?: string;
  createdAt?: Timestamp | Date;
  [key: string]: unknown;
};

export const firestoreService = {
  // User profile operations
  createUserProfile: async (
    uid: string,
    data: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>,
  ) => {
    const userRef = doc(db, 'users', uid);
    const now = Timestamp.now().toDate();

    await setDoc(userRef, {
      ...data,
      uid,
      createdAt: now,
      updatedAt: now,
    });
  },

  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    const userRef = doc(db, 'users', uid);
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
  },

  updateUserProfile: async (uid: string, data: Partial<UserProfile>) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: Timestamp.now().toDate(),
    });
  },

  getExercisesWithLibrary: async (userId: string): Promise<Exercise[]> => {
    const librarySnapshot = await getDocs(collection(db, 'exercisesLibrary'));
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

    const userSnapshot = await getDocs(collection(db, `users/${userId}/exercises`));
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
  },
};
