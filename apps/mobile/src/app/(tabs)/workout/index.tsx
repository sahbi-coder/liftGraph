import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
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

  const fetchLatestWorkout = useCallback(async () => {
    if (!user) {
      setLatestWorkout(null);
      return;
    }

    setIsLoadingLatest(true);
    try {
      const workout = await services.firestore.getLatestWorkout(user.uid);
      setLatestWorkout(workout);
    } finally {
      setIsLoadingLatest(false);
    }
  }, [services.firestore, user]);

  useFocusEffect(
    useCallback(() => {
      fetchLatestWorkout();
    }, [fetchLatestWorkout]),
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

  return (
    <YStack
      flex={1}
      justifyContent="flex-start"
      alignItems="stretch"
      backgroundColor={colors.darkerGray}
      padding="$4"
      space="$4"
    >
      <YStack space="$2" alignItems="flex-start">
        <Text color="$textPrimary" fontSize="$9" fontWeight="700">
          Ready to lift?
        </Text>
        <Text color="$textSecondary" fontSize="$5">
          Lest cursh your goals today
        </Text>
      </YStack>

      {latestWorkout && (
        <WorkoutSummaryCard
          date={latestWorkout.date}
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
        Start Workout
      </Button>
    </YStack>
  );
}
