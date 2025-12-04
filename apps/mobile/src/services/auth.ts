import {
  Auth,
  User,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';

export type AuthUser = {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date | null;
};

export class AuthService {
  constructor(private readonly client: Auth) {}

  async signUpWithEmail(email: string, password: string, displayName: string) {
    const userCredential = await createUserWithEmailAndPassword(this.client, email, password);
    await updateProfile(userCredential.user, { displayName });

    return userCredential;
  }

  async signInWithEmail(email: string, password: string) {
    return await signInWithEmailAndPassword(this.client, email, password);
  }

  async signOut() {
    return await firebaseSignOut(this.client);
  }

  async resetPassword(email: string) {
    return await sendPasswordResetEmail(this.client, email);
  }

  getCurrentUser(): User | null {
    return this.client.currentUser;
  }

  toAuthUser(user: User | null): AuthUser | null {
    if (!user) return null;

    // Extract creation time from Firebase Auth metadata
    const createdAt = user.metadata.creationTime ? new Date(user.metadata.creationTime) : null;

    return {
      uid: user.uid,
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      createdAt,
    };
  }
}
