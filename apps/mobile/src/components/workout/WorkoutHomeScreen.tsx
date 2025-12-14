import React from 'react';
import { ScrollView } from 'react-native';
import { YStack, Text, Button } from 'tamagui';

import { colors } from '@/theme/colors';
import { WorkoutSummaryCard } from '@/components/workout/WorkoutSummaryCard';
import type { Workout } from '@/services';
import { useTranslation } from '@/hooks/useTranslation';

type WorkoutHomeScreenProps = {
  latestWorkout?: Workout | null;
  earliestFutureWorkout?: Workout | null;
  onCreateWorkout: () => void;
  onEditWorkout: () => void;
  onEditFutureWorkout: () => void;
};

export function WorkoutHomeScreen({
  latestWorkout,
  earliestFutureWorkout,

  onCreateWorkout,
  onEditWorkout,
  onEditFutureWorkout,
}: WorkoutHomeScreenProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.darkerGray }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
    >
      <YStack space="$2" alignItems="flex-start">
        <Text color="$textSecondary" fontSize="$5">
          {t('workout.letsCrushGoals')}
        </Text>
      </YStack>

      {earliestFutureWorkout && (
        <WorkoutSummaryCard
          title={t('workout.upcomingWorkout')}
          buttonLabel={t('workout.startScheduledWorkout')}
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
        />
      )}

      {latestWorkout && (
        <WorkoutSummaryCard
          title={t('workout.previousWorkout')}
          buttonLabel={t('workout.reviewWorkout')}
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
        {t('workout.scheduleWorkout')}
      </Button>
    </ScrollView>
  );
}
