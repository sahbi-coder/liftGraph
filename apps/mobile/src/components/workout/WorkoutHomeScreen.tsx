import React from 'react';
import { ScrollView } from 'react-native';
import { YStack, Text, Button } from 'tamagui';

import { colors } from '@/theme/colors';
import { WorkoutSummaryCard } from '@/components/workout/WorkoutSummaryCard';
import type { Workout } from '@/domain';

type WorkoutHomeScreenProps = {
  latestWorkout: Workout | null;
  earliestFutureWorkout: Workout | null;
  isLoadingLatest: boolean;
  isLoadingFuture: boolean;
  onCreateWorkout: () => void;
  onEditWorkout: () => void;
  onEditFutureWorkout: () => void;
};

export function WorkoutHomeScreen({
  latestWorkout,
  earliestFutureWorkout,
  isLoadingLatest,
  isLoadingFuture,
  onCreateWorkout,
  onEditWorkout,
  onEditFutureWorkout,
}: WorkoutHomeScreenProps) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.darkerGray }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
    >
      <YStack space="$2" alignItems="flex-start">
        <Text color="$textSecondary" fontSize="$5">
          Let's crush your goals today
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
          onPress={onEditFutureWorkout}
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
          onPress={onEditWorkout}
          isLoading={isLoadingLatest}
        />
      )}

      <Button
        size="$5"
        backgroundColor="$secondaryButton"
        color="$secondaryButtonText"
        fontWeight="600"
        borderRadius="$4"
        onPress={onCreateWorkout}
        pressStyle={{ opacity: 0.85 }}
        alignSelf="stretch"
      >
        Schedule Workout
      </Button>
    </ScrollView>
  );
}
