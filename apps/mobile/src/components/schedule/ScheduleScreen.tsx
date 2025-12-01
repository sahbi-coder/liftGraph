import React, { useCallback, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import dayjs from 'dayjs';

import { Calendar } from '@/components/Calendar';
import { colors } from '@/theme/colors';
import type { Workout } from '@/domain';

type ScheduleScreenProps = {
  workouts: Workout[];
  onDayPress: (workoutId: string) => void;
};

export function ScheduleScreen({ workouts, onDayPress }: ScheduleScreenProps) {
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
        onDayPress(workout.id);
      }
    },
    [workoutsByDate, onDayPress],
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.darkerGray }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
    >
      <YStack space="$4">
        <YStack space="$2">
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
