import React, { useMemo } from 'react';
import { ScrollView, View, Dimensions } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import { BarChart3 } from '@tamagui/lucide-icons';
import { BarChart } from 'react-native-gifted-charts';
import dayjs from 'dayjs';

import { colors } from '@/theme/colors';
import { LoadingView, ErrorView } from '@/components/StatusViews';
import { CustomRangeModal } from '@/components/progress/CustomRangeModal';
import { DurationFilterButtons } from '@/components/progress/DurationFilterButtons';
import { useValidatedWorkouts } from '@/hooks/workout/useValidatedWorkouts';
import { useDateRangeFilter } from '@/hooks/common/useDateRangeFilter';
import { useExerciseSelection } from '@/hooks/exercise/useExerciseSelection';
import type { Workout } from '@/services';
import { buildWeeklyExerciseFrequencyByWeek } from '@/utils/strength';
import { useTranslation } from '@/hooks/common/useTranslation';

const screenWidth = Dimensions.get('window').width;

type WeeklyFrequencyChartProps = {
  workouts: Workout[];
};

function WeeklyFrequencyChart({ workouts: _workouts }: WeeklyFrequencyChartProps) {
  const { t } = useTranslation();
  const {
    filterType,
    customStartDate,
    customEndDate,
    isCustomRangeModalVisible,
    setIsCustomRangeModalVisible,
    dateRange,
    dateRangeDisplay,
    handleQuickFilter,
    handleOpenCustomRange,
    handleApplyCustomRange,
  } = useDateRangeFilter({
    workouts: _workouts,
    defaultFilter: 'month',
  });

  const { selectedExercise, handleOpenExercisePicker } = useExerciseSelection({
    defaultExercise: { id: 'squat', name: 'Squat' },
    exercisePickerPath: '/(tabs)/progress/exercises',
  });

  // Build weekly frequency data for the selected exercise
  const weeklyFrequencyData = useMemo(() => {
    const start = dateRange.startDate.toDate();
    const end = dateRange.endDate.toDate();
    const points = buildWeeklyExerciseFrequencyByWeek(_workouts, start, end);

    const sessionsByWeek = new Map<number, number>();
    points.forEach((p) => {
      if (p.exerciseId !== selectedExercise.id) return;
      const prev = sessionsByWeek.get(p.weekIndex) ?? 0;
      sessionsByWeek.set(p.weekIndex, prev + p.sessions);
    });

    if (sessionsByWeek.size === 0) {
      return [];
    }

    const maxWeekIndex = Math.max(...Array.from(sessionsByWeek.keys()));

    const data = [];
    for (let i = 0; i <= maxWeekIndex; i += 1) {
      const weekStart = dayjs(start).add(i * 7, 'day');
      data.push({
        value: sessionsByWeek.get(i) ?? 0,
        label: weekStart.format('MMM D'),
      });
    }

    return data;
  }, [_workouts, dateRange, selectedExercise.id]);

  // Determine a reasonable max value for the y-axis (frequency)
  const maxYValue = useMemo(() => {
    if (!weeklyFrequencyData.length) return 5;
    const maxVal = Math.max(...weeklyFrequencyData.map((d) => d.value));
    if (maxVal === 0) return 5;
    // Round up to nearest whole session
    return Math.ceil(maxVal);
  }, [weeklyFrequencyData]);

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
              backgroundColor="#8b5cf620"
              alignItems="center"
              justifyContent="center"
            >
              <BarChart3 size={32} color="#8b5cf6" />
            </YStack>
            <YStack flex={1} space="$1">
              <Text color="$textPrimary" fontSize="$7" fontWeight="700">
                {t('progress.workoutFrequency')}
              </Text>
            </YStack>
          </XStack>
          <Text color="$textSecondary" fontSize="$4">
            {t('progress.frequencyChartDescriptionShort')}
          </Text>
        </YStack>

        <YStack padding="$4" backgroundColor={colors.midGray} borderRadius="$4" space="$3">
          <XStack alignItems="center" justifyContent="space-between" marginBottom="$2" space="$3">
            <YStack flex={1}>
              <Text color="$textPrimary" fontSize="$5" fontWeight="600">
                {selectedExercise.name} - {t('progress.weeklyFrequency')}
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
              {t('progress.changeExercise')}
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
              data={weeklyFrequencyData}
              width={0.75 * screenWidth}
              height={220}
              barWidth={22}
              frontColor="#8b5cf6"
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
              yAxisLabelSuffix=""
              showGradient
              gradientColor="#8b5cf655"
            />
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

export default function FrequencyChartScreen() {
  const { workouts, isLoading, isError, refetch } = useValidatedWorkouts();

  if (isLoading) {
    return <LoadingView />;
  }

  if (isError) {
    return <ErrorView onRetry={refetch} />;
  }

  return <WeeklyFrequencyChart workouts={workouts} />;
}
