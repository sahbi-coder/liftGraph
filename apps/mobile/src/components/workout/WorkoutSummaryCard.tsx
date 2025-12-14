import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import _ from 'lodash';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Button, Text, XStack, YStack } from 'tamagui';
import { Clock3, Dumbbell } from '@tamagui/lucide-icons';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '@/theme/colors';
import { useTranslation } from '@/hooks/useTranslation';

dayjs.extend(relativeTime);

type WorkoutStatus = 'scheduled' | 'missed' | 'complete';

type WorkoutSummaryCardProps = {
  title: string;
  date: Date;
  validated: boolean;
  exerciseCount: number;
  onPress: () => void;
  isLoading?: boolean;
  setCount: number;
  averageRir: number;
  buttonLabel: string;
};

export function WorkoutSummaryCard({
  date,
  validated,
  exerciseCount,
  onPress,
  isLoading = false,
  setCount,
  averageRir,
  title,
  buttonLabel,
}: WorkoutSummaryCardProps) {
  const { t } = useTranslation();
  const isToday = dayjs(date).isSame(dayjs(), 'day');
  const isBeforeToday = dayjs(date).isBefore(dayjs(), 'day');
  const timeFromNow = _.upperFirst(useMemo(() => dayjs(date).fromNow(), [date]));
  const exerciseLabel = exerciseCount === 1 ? t('common.exercise') : t('common.exercises');
  const setLabel = setCount === 1 ? t('common.set') : t('common.sets');
  const formattedAverageRir =
    typeof averageRir === 'number' && Number.isFinite(averageRir) ? averageRir.toFixed(1) : '--';
  const timeFromNowLabel = isToday ? t('workout.today') : timeFromNow;

  // Compute status based on validated and date
  const status: WorkoutStatus = useMemo(() => {
    if (!validated && isBeforeToday) {
      return 'missed';
    }
    if (validated && (isToday || isBeforeToday)) {
      return 'complete';
    }
    return 'scheduled';
  }, [validated, isToday, isBeforeToday]);

  // Status display configuration
  const statusConfig = {
    scheduled: {
      label: t('workout.scheduled'),
      color: colors.niceOrange,
      backgroundColor: 'rgba(249, 115, 22, 0.15)',
    },
    missed: {
      label: t('workout.missed'),
      color: '#ef4444', // red-500
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
    },
    complete: {
      label: t('workout.complete'),
      color: '#22c55e', // green-500
      backgroundColor: 'rgba(34, 197, 94, 0.15)',
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <YStack
      backgroundColor={colors.midGray}
      padding="$4"
      borderRadius="$4"
      space="$3"
      gap="$3"
      alignSelf="stretch"
    >
      <YStack space="$1">
        <XStack alignItems="center" justifyContent="space-between">
          <Text color="$textTertiary" fontSize="$6">
            {title}
          </Text>
          <XStack alignItems="center" space="$2">
            <YStack
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius="$3"
              backgroundColor={currentStatus.backgroundColor}
              alignItems="center"
              justifyContent="center"
            >
              <Text color={currentStatus.color} fontSize="$3" fontWeight="600">
                {currentStatus.label}
              </Text>
            </YStack>
          </XStack>
        </XStack>
        <XStack alignItems="center" space="$2">
          <Text color="$textPrimary" fontSize="$4" fontWeight="700">
            {timeFromNowLabel}
          </Text>
          <Clock3 size={18} color={colors.niceOrange} />
        </XStack>
        <XStack alignItems="center" space="$2">
          <Text color="$textPrimary" fontSize="$4" fontWeight="600">
            {exerciseCount} {exerciseLabel}
          </Text>
          <Ionicons name="barbell" size={24} color={colors.niceOrange} />
        </XStack>
        <XStack alignItems="center" space="$2" justifyContent="space-between">
          <XStack alignItems="center" space="$2">
            <Text color="$textPrimary" fontSize="$3">
              {setCount} {setLabel}
            </Text>
            <Dumbbell size={18} color={colors.niceOrange} />
          </XStack>
          <XStack alignItems="center" space="$2">
            <Text color="$textSecondary" fontSize="$3" fontWeight="600">
              {t('workout.avgRir')} {formattedAverageRir}
            </Text>
          </XStack>
        </XStack>
      </YStack>
      <Button
        backgroundColor="$primaryButton"
        color="$primaryButtonText"
        fontWeight="600"
        borderRadius="$4"
        onPress={onPress}
        pressStyle={{ opacity: 0.85 }}
        disabled={isLoading}
        opacity={isLoading ? 0.6 : 1}
        alignSelf="stretch"
      >
        {isLoading ? t('workout.opening') : buttonLabel}
      </Button>
    </YStack>
  );
}
