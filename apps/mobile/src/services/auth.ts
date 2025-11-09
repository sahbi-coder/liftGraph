import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from '@/config/firebase';

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

export const authService = {
  // Sign up with email and password
  signUpWithEmail: async (email: string, password: string, displayName?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }

    return userCredential;
  },

  // Sign in with email and password
  signInWithEmail: async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
  },

  // Sign out
  signOut: async () => {
    return await firebaseSignOut(auth);
  },

  // Send password reset email
  resetPassword: async (email: string) => {
    return await sendPasswordResetEmail(auth, email);
  },

  // Get current user
  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },

  // Convert Firebase User to AuthUser
  toAuthUser: (user: User | null): AuthUser | null => {
    if (!user) return null;
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    };
  },
};
