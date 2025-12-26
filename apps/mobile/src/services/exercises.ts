import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore';

import { ExerciseSchema, type Exercise } from '@/domain';
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

  /**
   * Populates user's exercise collection from the library if it's empty
   * @returns Library exercises if collection was populated, undefined if collection already existed
   */
  private async populateFromLibrary(
    userId: string,
    language: string,
  ): Promise<Exercise[] | undefined> {
    const userExercisesRef = collection(
      this.db,
      this.getUserExerciseCollectionName(userId, language),
    );
    const userSnapshot = await getDocs(userExercisesRef);

    // If collection already has exercises, no need to populate
    if (!userSnapshot.empty) {
      return undefined;
    }

    // Fetch from library and copy to user's collection
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
        allowedUnits: data.allowedUnits,
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
          allowedUnits: exercise.allowedUnits,
          isCustom: false,
        });
      }
      await batch.commit();
    }

    return libraryExercises;
  }

  async getUserExercises(userId: string, language: string) {
    // Ensure the user's exercise collection is populated from library if empty
    await this.populateFromLibrary(userId, language);

    // Fetch and return user exercises
    const userExercisesRef = collection(
      this.db,
      this.getUserExerciseCollectionName(userId, language),
    );
    const userSnapshot = await getDocs(userExercisesRef);

    return userSnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const result = ExerciseSchema.safeParse({
        id: docSnap.id,
        name: data.name,
        category: data.category,
        bodyPart: data.bodyPart,
        description: data.description,
        allowedUnits: data.allowedUnits,
      });

      if (!result.success) {
        throw new ServiceError('exercise.invalidData');
      }
      return result.data;
    });
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
      allowedUnits: exercise.allowedUnits,
      isCustom: true,
      description: exercise.description?.trim(),
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
      allowedUnits: string[];
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
        allowedUnits: exercise.allowedUnits,
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
      allowedUnits: data.allowedUnits,
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
    // Try to populate from library, returns library exercises if collection was empty, undefined if it already existed
    const libraryExercises = await this.populateFromLibrary(userId, newLanguage);

    let newExerciseIds: Set<string>;

    if (libraryExercises) {
      // Collection was empty and was just populated, use library exercise IDs directly
      newExerciseIds = new Set(libraryExercises.map((ex) => ex.id));
    } else {
      // Collection already exists, fetch to get existing IDs
      const newExercisesRef = collection(
        this.db,
        this.getUserExerciseCollectionName(userId, newLanguage),
      );
      const newExercisesSnapshot = await getDocs(newExercisesRef);
      newExerciseIds = new Set(newExercisesSnapshot.docs.map((doc) => doc.id));
    }

    // Fetch exercises from old language
    const oldExercisesRef = collection(
      this.db,
      this.getUserExerciseCollectionName(userId, oldLanguage),
    );
    const oldExercisesSnapshot = await getDocs(oldExercisesRef);

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
          allowedUnits: data.allowedUnits,
          isCustom: data.isCustom ?? false,
        });
      }

      await batch.commit();
    }
  }
}
