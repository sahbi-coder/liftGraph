import React, { useEffect } from 'react';
import { YStack, XStack, Text, H1, Button } from 'tamagui';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useDependencies } from '@/dependencies/provider';

export default function IndexRoute() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const { services } = useDependencies();
  const firestoreService = services.firestore;

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading]);

  useEffect(() => {
    const loadExercises = async () => {
      if (!user) {
        return;
      }

      try {
        const exercises = await firestoreService.getExercisesWithLibrary(user.uid);
        console.log('Exercises:', exercises);
      } catch (error) {
        console.error('Failed to load exercises', error);
      }
    };

    loadExercises();
  }, [firestoreService, user]);

  if (loading) {
    return (
      <YStack flex={1} backgroundColor="$background" justifyContent="center" alignItems="center">
        <Text color="$textPrimary">Loading...</Text>
      </YStack>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <YStack flex={1} backgroundColor="$background" padding="$4">
      <StatusBar style="auto" />

      {/* Header with Sign Out */}
      <XStack justifyContent="space-between" alignItems="center" paddingTop="$6" paddingBottom="$4">
        <Text color="$textSecondary" fontSize="$4">
          Welcome, {user.displayName || user.email}!
        </Text>
        <Button size="$3" onPress={handleSignOut} variant="outlined">
          Sign Out
        </Button>
      </XStack>

      {/* Main Content */}
      <YStack flex={1} justifyContent="center" alignItems="center">
        <YStack space="$4" alignItems="center" maxWidth={600} width="100%">
          <H1 color="$textPrimary" fontSize="$10" fontWeight="bold">
            LiftGraph
          </H1>
          <Text color="$textSecondary" fontSize="$6" textAlign="center">
            Track your powerlifting progress
          </Text>
          <YStack space="$3" width="100%" marginTop="$6">
            <Button
              size="$5"
              backgroundColor="$primaryButton"
              color="$primaryButtonText"
              fontWeight="600"
              borderRadius="$4"
              pressStyle={{
                opacity: 0.8,
              }}
            >
              Start Workout
            </Button>
            <Button
              size="$5"
              variant="outlined"
              fontWeight="600"
              borderRadius="$4"
              pressStyle={{
                opacity: 0.8,
              }}
            >
              View History
            </Button>
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  );
}
