import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, View, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { YStack, XStack, Text, Button } from 'tamagui';
import { BarChart3 } from '@tamagui/lucide-icons';
import { BarChart } from 'react-native-gifted-charts';
import dayjs from 'dayjs';

import { colors } from '@/theme/colors';
import { LoadingView, ErrorView } from '@/components/StatusViews';
import { CustomRangeModal } from '@/components/progress/CustomRangeModal';
import {
  DurationFilterButtons,
  type FilterType,
} from '@/components/progress/DurationFilterButtons';
import { useUserWorkouts } from '@/hooks/useUserWorkouts';
import type { Workout } from '@/services/firestore';
import type { ExerciseSelection } from '@/app/(tabs)/workout/types';
import { setExercisePickerCallback } from '@/app/(tabs)/workout/exercisePickerContext';
import { buildWeeklyExerciseVolumeByWeek } from '@/utils/strength';

const screenWidth = Dimensions.get('window').width;

type WeeklyVolumeChartProps = {
  workouts: Workout[];
};

function WeeklyVolumeChart({ workouts: _workouts }: WeeklyVolumeChartProps) {
  const router = useRouter();
  const [selectedExercise, setSelectedExercise] = useState<{ id: string; name: string }>({
    id: 'squat',
    name: 'Squat',
  });
  const [filterType, setFilterType] = useState<FilterType>('month');
  const [customStartDate, setCustomStartDate] = useState<string | null>(null);
  const [customEndDate, setCustomEndDate] = useState<string | null>(null);
  const [isCustomRangeModalVisible, setIsCustomRangeModalVisible] = useState(false);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number | null>(null);

  const handleExerciseSelect = useCallback((exercise: ExerciseSelection) => {
    setSelectedExercise({ id: exercise.id, name: exercise.name });
  }, []);

  const handleOpenExercisePicker = useCallback(() => {
    setExercisePickerCallback(handleExerciseSelect);
    router.push('/(tabs)/progress/exercises');
  }, [handleExerciseSelect, router]);

  // Compute overall date range from workouts
  const overallRange = useMemo(() => {
    if (!_workouts.length) {
      const today = dayjs();
      return {
        minDate: today.subtract(3, 'month'),
        maxDate: today,
      };
    }

    let minDate = dayjs(_workouts[0].date);
    let maxDate = dayjs(_workouts[0].date);

    _workouts.forEach((w) => {
      const d = dayjs(w.date);
      if (d.isBefore(minDate)) minDate = d;
      if (d.isAfter(maxDate)) maxDate = d;
    });

    return { minDate, maxDate };
  }, [_workouts]);

  // Calculate date range based on filter type
  const dateRange = useMemo(() => {
    const today = dayjs();
    let startDate: dayjs.Dayjs;
    let endDate: dayjs.Dayjs;

    if (filterType === 'custom') {
      if (customStartDate && customEndDate) {
        startDate = dayjs(customStartDate);
        endDate = dayjs(customEndDate);
      } else {
        // Default to last 3 months if custom not set
        endDate = today;
        startDate = endDate.subtract(3, 'month');
      }
    } else {
      switch (filterType) {
        case 'month':
          endDate = today;
          startDate = endDate.subtract(1, 'month');
          break;
        case '3months':
          endDate = today;
          startDate = endDate.subtract(3, 'month');
          break;
        case '6months':
          endDate = today;
          startDate = endDate.subtract(6, 'month');
          break;
        case 'year':
          endDate = today;
          startDate = endDate.subtract(1, 'year');
          break;
        case 'all':
        default:
          startDate = overallRange.minDate;
          endDate = overallRange.maxDate;
          break;
      }
    }

    return { startDate, endDate };
  }, [filterType, customStartDate, customEndDate, overallRange]);

  // Build weekly volume data for the selected exercise
  const weeklyVolumeData = useMemo(() => {
    const start = dateRange.startDate.toDate();
    const end = dateRange.endDate.toDate();
    const points = buildWeeklyExerciseVolumeByWeek(_workouts, start, end);

    // Aggregate volume by week index for the selected exercise
    const volumeByWeek = new Map<number, number>();
    points.forEach((p) => {
      if (p.exerciseId !== selectedExercise.id) return;
      const prev = volumeByWeek.get(p.weekIndex) ?? 0;
      volumeByWeek.set(p.weekIndex, prev + p.totalVolume);
    });

    if (volumeByWeek.size === 0) {
      return [];
    }

    const maxWeekIndex = Math.max(...Array.from(volumeByWeek.keys()));

    const data = [];
    for (let i = 0; i <= maxWeekIndex; i += 1) {
      const weekStart = dayjs(start).add(i * 7, 'day');
      data.push({
        value: volumeByWeek.get(i) ?? 0,
        label: weekStart.format('MMM D'),
      });
    }

    return data;
  }, [_workouts, dateRange, selectedExercise.id]);

  // Determine a reasonable max value for the y-axis (volume)
  const maxYValue = useMemo(() => {
    if (!weeklyVolumeData.length) return 1000;
    const maxVal = Math.max(...weeklyVolumeData.map((d) => d.value));
    if (maxVal === 0) return 1000;
    // Round up to nearest 100 for a cleaner axis
    return Math.ceil(maxVal / 100) * 100;
  }, [weeklyVolumeData]);

  // Format date range display
  const dateRangeDisplay = useMemo(() => {
    if (filterType === 'custom' && customStartDate && customEndDate) {
      return `${dayjs(customStartDate).format('MMM D, YYYY')} - ${dayjs(customEndDate).format(
        'MMM D, YYYY',
      )}`;
    }
    return `${dateRange.startDate.format('MMM D, YYYY')} - ${dateRange.endDate.format(
      'MMM D, YYYY',
    )}`;
  }, [filterType, customStartDate, customEndDate, dateRange]);

  const handleQuickFilter = useCallback((type: FilterType) => {
    setFilterType(type);
    setCustomStartDate(null);
    setCustomEndDate(null);
  }, []);

  const handleOpenCustomRange = useCallback(() => {
    setIsCustomRangeModalVisible(true);
  }, []);

  const handleApplyCustomRange = useCallback((startDate: string, endDate: string) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    setFilterType('custom');
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.darkerGray }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
    >
      <YStack space="$4">
        <YStack padding="$4" backgroundColor={colors.midGray} borderRadius="$4" space="$3">
          <XStack alignItems="center" space="$3">
            <YStack
              width={64}
              height={64}
              borderRadius="$3"
              backgroundColor="#10b98120"
              alignItems="center"
              justifyContent="center"
            >
              <BarChart3 size={32} color="#10b981" />
            </YStack>
            <YStack flex={1} space="$1">
              <Text color="$textPrimary" fontSize="$7" fontWeight="700">
                Weekly Volume Load
              </Text>
            </YStack>
          </XStack>
          <Text color="$textSecondary" fontSize="$4">
            Weekly training volume (weight × reps) per lift. Helps track block transitions, deloads,
            and under/over-training trends.
          </Text>
        </YStack>

        <YStack padding="$4" backgroundColor={colors.midGray} borderRadius="$4" space="$3">
          <XStack alignItems="center" justifyContent="space-between" marginBottom="$2" space="$3">
            <YStack flex={1}>
              <Text color="$textPrimary" fontSize="$5" fontWeight="600">
                {selectedExercise.name} - Weekly Volume
              </Text>
              <Text color="$textSecondary" fontSize="$3">
                {dateRangeDisplay}
              </Text>
            </YStack>
            <Button
              size="$3"
              backgroundColor={colors.darkGray}
              color={colors.white}
              borderRadius="$3"
              paddingHorizontal="$3"
              paddingVertical="$2"
              onPress={handleOpenExercisePicker}
            >
              Change Exercise
            </Button>
          </XStack>

          <DurationFilterButtons
            filterType={filterType}
            onFilterChange={handleQuickFilter}
            onCustomRangePress={handleOpenCustomRange}
            availableFilters={['month', '3months', '6months', 'year', 'all', 'custom']}
          />

          <View
            style={{
              alignItems: 'center',
              marginVertical: 16,
            }}
          >
            <BarChart
              data={weeklyVolumeData}
              width={0.75 * screenWidth}
              height={220}
              barWidth={22}
              frontColor={colors.niceOrange}
              spacing={10}
              hideRules={false}
              rulesColor={colors.darkGray}
              yAxisColor={colors.darkGray}
              xAxisColor={colors.darkGray}
              yAxisTextStyle={{ color: colors.white }}
              xAxisLabelTextStyle={{ color: colors.white, fontSize: 10 }}
              noOfSections={4}
              maxValue={maxYValue}
              yAxisLabelWidth={60}
              yAxisLabelSuffix=" kg"
              showGradient
              gradientColor={`${colors.niceOrange}55`}
              onPress={(_item: unknown, index: number) => setSelectedWeekIndex(index)}
            />
            {selectedWeekIndex != null && weeklyVolumeData[selectedWeekIndex] && (
              <YStack
                marginTop="$3"
                padding="$3"
                backgroundColor={colors.darkGray}
                borderRadius="$3"
                alignItems="center"
                gap="$1"
                minWidth={140}
              >
                <Text color={colors.white} fontSize="$3">
                  Week starting {weeklyVolumeData[selectedWeekIndex].label}
                </Text>
                <Text color={colors.niceOrange} fontSize="$4" fontWeight="600">
                  {Math.round(weeklyVolumeData[selectedWeekIndex].value)} kg
                </Text>
              </YStack>
            )}
          </View>
        </YStack>

        <CustomRangeModal
          visible={isCustomRangeModalVisible}
          onClose={() => setIsCustomRangeModalVisible(false)}
          onApply={handleApplyCustomRange}
          initialStartDate={customStartDate}
          initialEndDate={customEndDate}
        />
      </YStack>
    </ScrollView>
  );
}

export default function WeeklyVolumeScreen() {
  const { workouts, isLoading, isError, refetch } = useUserWorkouts();

  if (isLoading) {
    return <LoadingView />;
  }

  if (isError) {
    return <ErrorView onRetry={refetch} />;
  }

  const validatedWorkouts = (workouts ?? []).filter((workout) => workout.validated);

  return <WeeklyVolumeChart workouts={validatedWorkouts} />;
}
