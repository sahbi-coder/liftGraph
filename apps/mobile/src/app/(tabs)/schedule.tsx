import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { YStack, XStack, Text } from 'tamagui';
import dayjs from 'dayjs';

import { Calendar } from '@/components/Calendar';
import { useDependencies } from '@/dependencies/provider';
import { useAuth } from '@/contexts/AuthContext';
import { Workout } from '@/services/firestore';
import { colors } from '@/theme/colors';

export default function ScheduleScreen() {
  const router = useRouter();
  const { services } = useDependencies();
  const { user } = useAuth();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkouts = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const fetchedWorkouts = await services.firestore.getWorkouts(user.uid);
      setWorkouts(fetchedWorkouts);
    } catch (error) {
      console.error('Failed to load workouts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [services.firestore, user]);

  useFocusEffect(
    useCallback(() => {
      fetchWorkouts();
    }, [fetchWorkouts]),
  );

  // Create a map of dates to workouts for quick lookup
  const workoutsByDate = useMemo(() => {
    const map = new Map<string, Workout>();
    workouts.forEach((workout) => {
      const dateKey = dayjs(workout.date).format('YYYY-MM-DD');
      map.set(dateKey, workout);
    });
    return map;
  }, [workouts]);

  // Create marked dates for the calendar
  const markedDates = useMemo(() => {
    const marked: Record<
      string,
      { selected: boolean; selectedColor: string; selectedTextColor: string }
    > = {};

    workoutsByDate.forEach((workout, dateKey) => {
      marked[dateKey] = {
        selected: true,
        selectedColor: workout.validated ? colors.niceOrange : colors.white,
        selectedTextColor: workout.validated ? colors.white : colors.darkerGray,
      };
    });

    return marked;
  }, [workoutsByDate]);

  // Handle day press - navigate to edit screen if workout exists
  const handleDayPress = useCallback(
    (day: { dateString: string }) => {
      const workout = workoutsByDate.get(day.dateString);
      if (workout) {
        router.push({
          pathname: '/(tabs)/workout/edit',
          params: { workoutId: workout.id },
        });
      }
    },
    [router, workoutsByDate],
  );

  if (!user) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={colors.darkerGray}
        padding="$4"
      >
        <Text color={colors.white} fontSize="$5" textAlign="center">
          Please sign in to view your schedule.
        </Text>
      </YStack>
    );
  }

  if (isLoading) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={colors.darkerGray}
      >
        <Text color={colors.white}>Loading schedule...</Text>
      </YStack>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.darkerGray }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
    >
      <YStack space="$4">
        <YStack space="$2">
          <Text color="$textPrimary" fontSize="$9" fontWeight="700">
            Schedule
          </Text>
          <Text color="$textSecondary" fontSize="$5">
            Tap on a marked day to view or edit your workout
          </Text>
        </YStack>

        <YStack padding="$4" backgroundColor={colors.midGray} borderRadius="$4" space="$3">
          <Calendar
            current={dayjs().format('YYYY-MM-DD')}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={{
              backgroundColor: colors.darkerGray,
              calendarBackground: colors.midGray,
            }}
            enableSwipeMonths
          />
        </YStack>

        <YStack space="$2" padding="$3" backgroundColor={colors.midGray} borderRadius="$4">
          <Text color="$textPrimary" fontSize="$5" fontWeight="600">
            Legend
          </Text>
          <YStack space="$2">
            <XStack alignItems="center" space="$2">
              <YStack
                width={24}
                height={24}
                borderRadius="$2"
                backgroundColor={colors.niceOrange}
              />
              <Text color="$textPrimary" fontSize="$4">
                Validated workout
              </Text>
            </XStack>
            <XStack alignItems="center" space="$2">
              <YStack width={24} height={24} borderRadius="$2" backgroundColor={colors.white} />
              <Text color="$textPrimary" fontSize="$4">
                Non-validated workout
              </Text>
            </XStack>
          </YStack>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
