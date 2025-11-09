import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

// User management function - creates user profile on signup
export const createUserProfile = onDocumentCreated('users/{userId}', async (event) => {
  const userId = event.params.userId;
  const userData = event.data?.data();

  if (!userData) {
    console.log('No user data found');
    return;
  }

  console.log(`User profile created for ${userId}`);
  return null;
});

// Example callable function - get user stats
export const getUserStats = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;

  try {
    const workoutsSnapshot = await db.collection(`users/${userId}/workouts`).get();

    const totalWorkouts = workoutsSnapshot.size;

    return {
      totalWorkouts,
      userId,
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw new HttpsError('internal', 'Failed to get user stats');
  }
});

// Clean up deleted user data
export const onUserDeleted = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;

  try {
    // Delete user document
    await db.doc(`users/${userId}`).delete();

    // Delete user from Auth
    await auth.deleteUser(userId);

    console.log(`User ${userId} and all data deleted`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new HttpsError('internal', 'Failed to delete user');
  }
});
