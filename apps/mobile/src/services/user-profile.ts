import { Firestore, Timestamp, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { UserProfile } from '@/domain';
import { UserProfileSchema, UserPreferencesSchema } from '@/domain';
import { ServiceError } from '@/utils/serviceErrors';

export class UserProfileService {
  constructor(private readonly db: Firestore) {}

  async createUserProfile(uid: string, data: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>) {
    // Validate preferences if provided
    if (data.preferences) {
      const preferencesResult = UserPreferencesSchema.safeParse(data.preferences);
      if (!preferencesResult.success) {
        throw new ServiceError('userPreferences.invalid');
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
      throw new ServiceError('userProfile.invalidData');
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
}
