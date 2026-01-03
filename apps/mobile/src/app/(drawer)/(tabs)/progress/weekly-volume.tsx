import React, { useMemo, useState } from 'react';
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
import { buildWeeklyExerciseVolumeByWeek, buildWeeklyExerciseRPEByWeek } from '@/utils/strength';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { weightForDisplay } from '@/utils/units';
import { useTranslation } from '@/hooks/common/useTranslation';

const screenWidth = Dimensions.get('window').width;

type WeeklyVolumeChartProps = {
  workouts: Workout[];
};

function WeeklyVolumeChart({ workouts: _workouts }: WeeklyVolumeChartProps) {
  const { preferences } = useUserPreferences();
  const weightUnit = preferences?.weightUnit ?? 'kg';
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number | null>(null);
  const [selectedRPEWeekIndex, setSelectedRPEWeekIndex] = useState<number | null>(null);
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
    defaultExercise: { id: 'squat', name: t('exercise.squat') },
    exercisePickerPath: '/(tabs)/progress/exercises',
    filterByLoad: true, // Only show weighted exercises for volume chart
    persistenceKey: 'weekly-volume',
  });

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
      const volumeInKg = volumeByWeek.get(i) ?? 0;
      // Convert volume from kg to display unit
      // Note: Volume is weight × reps, so we convert the weight component
      data.push({
        value: weightForDisplay(volumeInKg, weightUnit),
        label: weekStart.format('MMM D'),
      });
    }

    return data;
  }, [_workouts, dateRange, selectedExercise.id, weightUnit]);

  // Build weekly RPE data for the selected exercise
  const weeklyRPEData = useMemo(() => {
    const start = dateRange.startDate.toDate();
    const end = dateRange.endDate.toDate();
    const points = buildWeeklyExerciseRPEByWeek(_workouts, start, end);

    // Aggregate RPE by week index for the selected exercise
    const rpeByWeek = new Map<number, { totalRPE: number; count: number }>();
    points.forEach((p) => {
      if (p.exerciseId !== selectedExercise.id) return;
      const existing = rpeByWeek.get(p.weekIndex);
      if (existing) {
        existing.totalRPE += p.averageRPE;
        existing.count += 1;
      } else {
        rpeByWeek.set(p.weekIndex, { totalRPE: p.averageRPE, count: 1 });
      }
    });

    // Calculate max week index from volume data to keep charts aligned
    const volumePoints = buildWeeklyExerciseVolumeByWeek(_workouts, start, end);
    const volumeByWeek = new Map<number, number>();
    volumePoints.forEach((p) => {
      if (p.exerciseId !== selectedExercise.id) return;
      const prev = volumeByWeek.get(p.weekIndex) ?? 0;
      volumeByWeek.set(p.weekIndex, prev + p.totalVolume);
    });

    const maxWeekIndex =
      volumeByWeek.size > 0
        ? Math.max(...Array.from(volumeByWeek.keys()))
        : rpeByWeek.size > 0
          ? Math.max(...Array.from(rpeByWeek.keys()))
          : 0;

    const data = [];
    for (let i = 0; i <= maxWeekIndex; i += 1) {
      const weekStart = dayjs(start).add(i * 7, 'day');
      const weekData = rpeByWeek.get(i);
      const averageRPE = weekData ? weekData.totalRPE / weekData.count : 0;
      data.push({
        value: averageRPE,
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

  // Determine max value for RPE chart (always 10)
  const maxRPEValue = 10;

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
                {t('progress.weeklyVolumeLoad')}
              </Text>
            </YStack>
          </XStack>
          <Text color="$textSecondary" fontSize="$4">
            {t('progress.weeklyVolumeLoadDescription')}
          </Text>
        </YStack>

        <YStack padding="$4" backgroundColor={colors.midGray} borderRadius="$4" space="$3">
          <XStack alignItems="center" justifyContent="space-between" marginBottom="$2" space="$3">
            <YStack flex={1}>
              <Text color="$textPrimary" fontSize="$5" fontWeight="600">
                {selectedExercise.name} - {t('progress.weeklyVolumeLabel')}
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
              yAxisLabelSuffix={
                weightUnit === 'lb' ? ` ${t('common.unitLbs')}` : ` ${t('common.unitKg')}`
              }
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
                  {t('progress.weekStarting', { date: weeklyVolumeData[selectedWeekIndex].label })}
                </Text>
                <Text color={colors.niceOrange} fontSize="$4" fontWeight="600">
                  {Math.round(weeklyVolumeData[selectedWeekIndex].value)}{' '}
                  {weightUnit === 'lb' ? t('common.unitLbs') : t('common.unitKg')}
                </Text>
              </YStack>
            )}
          </View>
        </YStack>

        {/* Average Weekly RPE Chart */}
        <YStack padding="$4" backgroundColor={colors.midGray} borderRadius="$4" space="$3">
          <YStack marginBottom="$2">
            <Text color="$textPrimary" fontSize="$5" fontWeight="600">
              {selectedExercise.name} - {t('progress.averageWeeklyRPE')}
            </Text>
            <Text color="$textSecondary" fontSize="$3">
              {dateRangeDisplay}
            </Text>
            <Text color="$textSecondary" fontSize="$3" marginTop="$2">
              {t('progress.averageWeeklyRPEDescription')}
            </Text>
          </YStack>

          <View
            style={{
              alignItems: 'center',
              marginVertical: 16,
            }}
          >
            <BarChart
              data={weeklyRPEData}
              width={0.75 * screenWidth}
              height={220}
              barWidth={22}
              frontColor="#3b82f6"
              spacing={10}
              hideRules={false}
              rulesColor={colors.darkGray}
              yAxisColor={colors.darkGray}
              xAxisColor={colors.darkGray}
              yAxisTextStyle={{ color: colors.white, paddingRight: 8 }}
              xAxisLabelTextStyle={{ color: colors.white, fontSize: 10 }}
              noOfSections={5}
              maxValue={maxRPEValue}
              yAxisLabelWidth={50}
              yAxisLabelSuffix=" RPE"
              showGradient
              gradientColor="#3b82f655"
              onPress={(_item: unknown, index: number) => setSelectedRPEWeekIndex(index)}
            />
            {selectedRPEWeekIndex != null &&
              weeklyRPEData[selectedRPEWeekIndex] &&
              weeklyRPEData[selectedRPEWeekIndex].value > 0 && (
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
                    {t('progress.weekStarting', {
                      date: weeklyRPEData[selectedRPEWeekIndex].label,
                    })}
                  </Text>
                  <Text color="#3b82f6" fontSize="$4" fontWeight="600">
                    {weeklyRPEData[selectedRPEWeekIndex].value.toFixed(1)} RPE
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
  const { workouts, isLoading, isError, refetch } = useValidatedWorkouts();

  if (isLoading) {
    return <LoadingView />;
  }

  if (isError) {
    return <ErrorView onRetry={refetch} />;
  }

  return <WeeklyVolumeChart workouts={workouts} />;
}
