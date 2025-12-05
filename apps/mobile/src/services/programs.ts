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
} from 'firebase/firestore';
import type { Program, ProgramInput, ProgramWeek, ProgramPhase } from '@/domain';
import { ProgramSchema, ProgramInputSchema } from '@/domain';

// Firestore-specific type for program data storage
type ProgramFirestoreData = {
  name: string;
  description: string;
  type: 'simple' | 'alternating' | 'advanced';
  week?: ProgramWeek;
  alternatingWeeks?: [ProgramWeek, ProgramWeek];
  phases?: ProgramPhase[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export class ProgramsService {
  constructor(private readonly db: Firestore) {}

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
}
