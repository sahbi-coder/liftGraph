import React, { useCallback, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { YStack, Text, Button } from 'tamagui';

import { useDependencies } from '@/dependencies/provider';
import { useAuth } from '@/contexts/AuthContext';
import { Workout } from '@/services/firestore';
import { colors } from '@/theme/colors';
import { WorkoutSummaryCard } from '@/components/workout/WorkoutSummaryCard';

export default function WorkoutHomeScreen() {
  const router = useRouter();
  const { services } = useDependencies();
  const { user } = useAuth();
  const [latestWorkout, setLatestWorkout] = useState<Workout | null>(null);
  const [isLoadingLatest, setIsLoadingLatest] = useState(false);
  const [earliestFutureWorkout, setEarliestFutureWorkout] = useState<Workout | null>(null);
  const [isLoadingFuture, setIsLoadingFuture] = useState(false);

  const fetchLatestWorkout = useCallback(async () => {
    if (!user) {
      setLatestWorkout(null);
      return;
    }

    setIsLoadingLatest(true);
    try {
      const workout = await services.firestore.getLatestValidatedWorkout(user.uid);
      setLatestWorkout(workout);
    } finally {
      setIsLoadingLatest(false);
    }
  }, [services.firestore, user]);

  const fetchEarliestFutureWorkout = useCallback(async () => {
    if (!user) {
      setEarliestFutureWorkout(null);
      return;
    }

    setIsLoadingFuture(true);
    try {
      const workout = await services.firestore.getEarliestNonValidatedFutureWorkout(user.uid);
      setEarliestFutureWorkout(workout);
    } finally {
      setIsLoadingFuture(false);
    }
  }, [services.firestore, user]);

  useFocusEffect(
    useCallback(() => {
      console.log('fetching latest and future workouts');
      const latest = fetchLatestWorkout();
      console.log('latest', latest);
      fetchEarliestFutureWorkout();
    }, [fetchLatestWorkout, fetchEarliestFutureWorkout]),
  );

  const handleCreateWorkout = useCallback(() => {
    router.push('/(tabs)/workout/create');
  }, [router]);

  const handleEditWorkout = useCallback(() => {
    console.log('latestWorkout', latestWorkout);
    if (!user) {
      Alert.alert('Not signed in', 'Please sign in to edit workouts.');
      return;
    }

    if (!latestWorkout) {
      Alert.alert('No workouts yet', 'Create a workout before trying to edit.');
      return;
    }

    router.push({
      pathname: '/(tabs)/workout/edit',
      params: { workoutId: latestWorkout.id },
    });
  }, [latestWorkout, router, user]);

  const handleEditFutureWorkout = useCallback(() => {
    if (!user) {
      Alert.alert('Not signed in', 'Please sign in to edit workouts.');
      return;
    }

    if (!earliestFutureWorkout) {
      Alert.alert('No future workouts', 'No upcoming workouts to edit.');
      return;
    }

    router.push({
      pathname: '/(tabs)/workout/edit',
      params: { workoutId: earliestFutureWorkout.id },
    });
  }, [earliestFutureWorkout, router, user]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.darkerGray }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
    >
      <YStack space="$2" alignItems="flex-start">
        <Text color="$textPrimary" fontSize="$9" fontWeight="700">
          Ready to lift?
        </Text>
        <Text color="$textSecondary" fontSize="$5">
          Lest cursh your goals today
        </Text>
      </YStack>

      {earliestFutureWorkout && (
        <WorkoutSummaryCard
          title="Upcoming workout"
          buttonLabel="Start Scheduled Workout"
          date={earliestFutureWorkout.date}
          validated={earliestFutureWorkout.validated}
          exerciseCount={earliestFutureWorkout.exercises.length}
          setCount={earliestFutureWorkout.exercises.reduce(
            (sum, exercise) => sum + exercise.sets.length,
            0,
          )}
          averageRir={(() => {
            const { totalSets, totalRir } = earliestFutureWorkout.exercises.reduce(
              (acc, exercise) => {
                acc.totalSets += exercise.sets.length;
                acc.totalRir += exercise.sets.reduce((setSum, set) => setSum + set.rir, 0);
                return acc;
              },
              { totalSets: 0, totalRir: 0 },
            );
            return totalSets > 0 ? totalRir / totalSets : 0;
          })()}
          onPress={handleEditFutureWorkout}
          isLoading={isLoadingFuture}
        />
      )}
      {latestWorkout && (
        <WorkoutSummaryCard
          title="Previous workout"
          buttonLabel="Review Workout"
          date={latestWorkout.date}
          validated={latestWorkout.validated}
          exerciseCount={latestWorkout.exercises.length}
          setCount={latestWorkout.exercises.reduce(
            (sum, exercise) => sum + exercise.sets.length,
            0,
          )}
          averageRir={(() => {
            const { totalSets, totalRir } = latestWorkout.exercises.reduce(
              (acc, exercise) => {
                acc.totalSets += exercise.sets.length;
                acc.totalRir += exercise.sets.reduce((setSum, set) => setSum + set.rir, 0);
                return acc;
              },
              { totalSets: 0, totalRir: 0 },
            );
            return totalSets > 0 ? totalRir / totalSets : 0;
          })()}
          onPress={handleEditWorkout}
          isLoading={isLoadingLatest}
        />
      )}
      <Button
        size="$5"
        backgroundColor="$secondaryButton"
        color="$secondaryButtonText"
        fontWeight="600"
        borderRadius="$4"
        onPress={handleCreateWorkout}
        pressStyle={{ opacity: 0.85 }}
        alignSelf="stretch"
      >
        Schedule Workout
      </Button>
    </ScrollView>
  );
}
