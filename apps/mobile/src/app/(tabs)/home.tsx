import React, { useCallback, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { YStack, Text, Button } from 'tamagui';

import { useAuth } from '@/contexts/AuthContext';
import { useDependencies } from '@/dependencies/provider';
import { Workout } from '@/services/firestore';
import { colors } from '@/theme/colors';
import { WorkoutSummaryCard } from '@/components/workout/WorkoutSummaryCard';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const { services } = useDependencies();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [todaysWorkout, setTodaysWorkout] = useState<Workout | null>(null);
  const [isLoadingToday, setIsLoadingToday] = useState(false);

  const fetchTodaysWorkout = useCallback(async () => {
    if (!user) {
      setTodaysWorkout(null);
      return;
    }

    setIsLoadingToday(true);
    try {
      const workout = await services.firestore.getTodaysWorkout(user.uid);
      setTodaysWorkout(workout);
    } finally {
      setIsLoadingToday(false);
    }
  }, [services.firestore, user]);

  useFocusEffect(
    useCallback(() => {
      fetchTodaysWorkout();
    }, [fetchTodaysWorkout]),
  );

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);

    try {
      await signOut();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign out.';
      Alert.alert('Sign out failed', message);
      setIsSigningOut(false);
    }
  }, [signOut]);

  const handleEditTodaysWorkout = useCallback(() => {
    if (!user) {
      Alert.alert('Not signed in', 'Please sign in to edit workouts.');
      return;
    }

    if (!todaysWorkout) {
      Alert.alert('No workout today', 'No workout scheduled for today.');
      return;
    }

    router.push({
      pathname: '/(tabs)/workout/edit',
      params: { workoutId: todaysWorkout.id },
    });
  }, [todaysWorkout, router, user]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.darkerGray }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
    >
      <YStack space="$2" alignItems="flex-start">
        <Text color="$textPrimary" fontSize="$6" fontWeight="600">
          Welcome{user?.displayName ? `, ${user.displayName}` : ''}!
        </Text>
        <Text color="$textSecondary">
          {user?.email ? `Signed in as ${user.email}` : 'You are signed in.'}
        </Text>
      </YStack>

      {todaysWorkout && (
        <WorkoutSummaryCard
          title="Today's workout"
          buttonLabel={`${todaysWorkout.validated ? 'Review' : 'Start'} Today's Workout`}
          date={todaysWorkout.date}
          validated={todaysWorkout.validated}
          exerciseCount={todaysWorkout.exercises.length}
          setCount={todaysWorkout.exercises.reduce(
            (sum, exercise) => sum + exercise.sets.length,
            0,
          )}
          averageRir={(() => {
            const { totalSets, totalRir } = todaysWorkout.exercises.reduce(
              (acc, exercise) => {
                acc.totalSets += exercise.sets.length;
                acc.totalRir += exercise.sets.reduce((setSum, set) => setSum + set.rir, 0);
                return acc;
              },
              { totalSets: 0, totalRir: 0 },
            );
            return totalSets > 0 ? totalRir / totalSets : 0;
          })()}
          onPress={handleEditTodaysWorkout}
          isLoading={isLoadingToday}
        />
      )}

      <Button
        size="$4"
        backgroundColor="$backgroundStrong"
        color="$textPrimary"
        onPress={handleSignOut}
        disabled={isSigningOut}
        opacity={isSigningOut ? 0.6 : 1}
      >
        {isSigningOut ? 'Signing out...' : 'Log out'}
      </Button>
    </ScrollView>
  );
}
