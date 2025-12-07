import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore';

import { ExerciseSchema } from '@/domain';
import { ServiceError } from '@/utils/serviceErrors';

export class ExercisesService {
  constructor(private readonly db: Firestore) {}

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
          throw new ServiceError('exercise.invalidData');
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
        throw new ServiceError('exercise.invalidData');
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
      throw new ServiceError('exercise.alreadyExists');
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
}
