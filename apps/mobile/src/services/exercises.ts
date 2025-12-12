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
import { SupportedLanguage } from '@/locale/i18n';

export class ExercisesService {
  constructor(private readonly db: Firestore) {}
  private getExerciseLibraryName(language: SupportedLanguage) {
    switch (language) {
      case 'es':
        return 'exercisesLibraryEs';
      case 'fr':
        return 'exercisesLibraryFr';
      default:
        return 'exercisesLibrary';
    }
  }
  private getAllExerciseLibraries() {
    return ['exercisesLibrary', 'exercisesLibraryEs', 'exercisesLibraryFr'];
  }
  private getUserExerciseCollectionName(userId: string, language: SupportedLanguage) {
    switch (language) {
      case 'es':
        return `users/${userId}/exercisesEs`;
      case 'fr':
        return `users/${userId}/exercisesFr`;
      default:
        return `users/${userId}/exercises`;
    }
  }
  private getAllUserExerciseCollections(userId: string) {
    return [
      `users/${userId}/exercises`,
      `users/${userId}/exercisesEs`,
      `users/${userId}/exercisesFr`,
    ];
  }

  async getUserExercises(userId: string, language: SupportedLanguage) {
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
    language: SupportedLanguage,
    exercise: {
      name: string;
      category: string;
      bodyPart: string;
      description?: string;
    },
  ): Promise<string> {
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
    language: SupportedLanguage,
    exerciseId: string,
    exercise: {
      name: string;
      category: string;
      bodyPart: string;
      description?: string;
    },
  ): Promise<void> {
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

  async getExercise(userId: string, exerciseId: string, language: SupportedLanguage) {
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
}
