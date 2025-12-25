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
  private getExerciseLibraryName(language: string) {
    switch (language) {
      case 'es':
        return 'exercisesLibraryEs';
      case 'fr':
        return 'exercisesLibraryFr';
      default:
        return 'exercisesLibrary';
    }
  }

  private getUserExerciseCollectionName(userId: string, language: string) {
    switch (language) {
      case 'es':
        return `users/${userId}/exercisesEs`;
      case 'fr':
        return `users/${userId}/exercisesFr`;
      default:
        return `users/${userId}/exercises`;
    }
  }

  async getUserExercises(userId: string, language: string) {
    const userExercisesRef = collection(
      this.db,
      this.getUserExerciseCollectionName(userId, language),
    );

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
    const librarySnapshot = await getDocs(
      collection(this.db, this.getExerciseLibraryName(language)),
    );
    const libraryExercises = librarySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const result = ExerciseSchema.safeParse({
        id: docSnap.id,
        name: data.name,
        category: data.category,
        bodyPart: data.bodyPart,
        description: data.description,
        isCustom: false,
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
        batch.set(doc(this.db, this.getUserExerciseCollectionName(userId, language), exercise.id), {
          name: exercise.name,
          category: exercise.category,
          bodyPart: exercise.bodyPart,
          description: exercise.description,
          isCustom: false,
        });
      }
      await batch.commit();
    }

    return libraryExercises;
  }

  async createExercise(
    userId: string,
    language: string,
    exercise: {
      name: string;
      category: string;
      bodyPart: string;
      description?: string;
    },
  ) {
    // Generate ID from name: lowercase with spaces replaced by hyphens
    const exerciseId = exercise.name.trim().toLowerCase().replace(/\s+/g, '-');

    // Check if exercise with this ID exists in English list (users/${userId}/exercises)
    const englishExerciseRef = doc(
      this.db,
      this.getUserExerciseCollectionName(userId, language),
      exerciseId,
    );
    const englishExerciseDoc = await getDoc(englishExerciseRef);

    if (englishExerciseDoc.exists()) {
      throw new ServiceError('exercise.alreadyExists');
    }

    // Prepare exercise data
    const exerciseData = {
      name: exercise.name.trim(),
      category: exercise.category.trim(),
      bodyPart: exercise.bodyPart.trim(),
      description: exercise.description?.trim(),
      isCustom: true,
    };

    const exerciseRef = doc(
      this.db,
      this.getUserExerciseCollectionName(userId, language),
      exerciseId,
    );
    await setDoc(exerciseRef, exerciseData);

    return exerciseId;
  }

  async updateExercise(
    userId: string,
    language: string,
    exerciseId: string,
    exercise: {
      name: string;
      category: string;
      bodyPart: string;
      description?: string;
    },
  ) {
    const userExerciseRef = doc(
      this.db,
      this.getUserExerciseCollectionName(userId, language),
      exerciseId,
    );
    const userExerciseDoc = await getDoc(userExerciseRef);

    if (!userExerciseDoc.exists()) {
      throw new ServiceError('exercise.notFound');
    }

    await setDoc(
      userExerciseRef,
      {
        name: exercise.name.trim(),
        category: exercise.category.trim(),
        bodyPart: exercise.bodyPart.trim(),
        description: exercise.description?.trim(),
        isCustom: userExerciseDoc.data().isCustom,
      },
      { merge: false },
    );
  }

  async getExercise(userId: string, exerciseId: string, language: string) {
    const userExerciseRef = doc(
      this.db,
      this.getUserExerciseCollectionName(userId, language),
      exerciseId,
    );
    const userExerciseDoc = await getDoc(userExerciseRef);

    if (!userExerciseDoc.exists()) {
      throw new ServiceError('exercise.notFound');
    }

    const data = userExerciseDoc.data();
    const result = ExerciseSchema.safeParse({
      id: userExerciseDoc.id,
      name: data.name,
      category: data.category,
      bodyPart: data.bodyPart,
      description: data.description,
    });

    if (!result.success) {
      throw new ServiceError('exercise.invalidData');
    }

    return result.data;
  }

  async syncExercisesFromLanguage(
    userId: string,
    oldLanguage: string,
    newLanguage: string,
  ): Promise<void> {
    // Fetch exercises from old language
    const oldExercisesRef = collection(
      this.db,
      this.getUserExerciseCollectionName(userId, oldLanguage),
    );
    const oldExercisesSnapshot = await getDocs(oldExercisesRef);

    // Fetch exercises from new language
    const newExercisesRef = collection(
      this.db,
      this.getUserExerciseCollectionName(userId, newLanguage),
    );
    const newExercisesSnapshot = await getDocs(newExercisesRef);

    // Create a set of exercise IDs that exist in new language
    const newExerciseIds = new Set(newExercisesSnapshot.docs.map((doc) => doc.id));

    // Find exercises in old language that are missing in new language
    const exercisesToCopy = oldExercisesSnapshot.docs.filter((doc) => !newExerciseIds.has(doc.id));

    // Copy missing exercises to new language collection
    if (exercisesToCopy.length > 0) {
      const batch = writeBatch(this.db);
      const newCollectionName = this.getUserExerciseCollectionName(userId, newLanguage);

      for (const docSnap of exercisesToCopy) {
        const data = docSnap.data();
        batch.set(doc(this.db, newCollectionName, docSnap.id), {
          name: data.name,
          category: data.category,
          bodyPart: data.bodyPart,
          description: data.description,
          isCustom: data.isCustom ?? false,
        });
      }

      await batch.commit();
    }
  }
}
