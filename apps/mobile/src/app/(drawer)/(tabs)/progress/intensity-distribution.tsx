import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import { PieChart } from '@tamagui/lucide-icons';
// Note: react-native-gifted-charts may not have PieChart
// If this import fails, we'll need to use an alternative visualization
// Note: react-native-gifted-charts may not have PieChart
// If this import fails, we'll need to use an alternative visualization
import { PieChart as PieChartComponent } from 'react-native-gifted-charts';
import { colors } from '@/theme/colors';
import { LoadingView, ErrorView } from '@/components/StatusViews';
import { CustomRangeModal } from '@/components/progress/CustomRangeModal';
import { DurationFilterButtons } from '@/components/progress/DurationFilterButtons';
import { useValidatedWorkouts } from '@/hooks/workout/useValidatedWorkouts';
import { useDateRangeFilter } from '@/hooks/common/useDateRangeFilter';
import { useExerciseSelection } from '@/hooks/exercise/useExerciseSelection';
import type { Workout } from '@/services';
import { calculateIntensityDistribution } from '@/utils/strength';
import { useTranslation } from '@/hooks/common/useTranslation';

type IntensityDistributionChartProps = {
  workouts: Workout[];
};

function IntensityDistributionChart({ workouts: _workouts }: IntensityDistributionChartProps) {
  const { t } = useTranslation();

  const { selectedExercise, handleOpenExercisePicker } = useExerciseSelection({
    defaultExercise: { id: 'squat', name: t('exercise.squat') },
    exercisePickerPath: '/(tabs)/progress/exercises',
    filterByLoad: true, // Only show weighted exercises for intensity distribution chart
    persistenceKey: 'intensity-distribution',
  });

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
    defaultFilter: '3months',
  });

  // Calculate intensity distribution for the selected exercise and date range
  const intensityDistribution = useMemo(() => {
    return calculateIntensityDistribution(
      _workouts,
      selectedExercise.id,
      dateRange.startDate.toDate(),
      dateRange.endDate.toDate(),
    );
  }, [_workouts, selectedExercise.id, dateRange.startDate, dateRange.endDate]);

  // Prepare pie chart data
  const pieData = useMemo(() => {
    const total =
      intensityDistribution.below60 +
      intensityDistribution.between60and70 +
      intensityDistribution.between70and80 +
      intensityDistribution.between80and90 +
      intensityDistribution.above90;

    if (total === 0) {
      return [];
    }

    const colorArray = [
      '#3b82f6', // blue for <60%
      '#10b981', // green for 60-70%
      '#f59e0b', // amber for 70-80%
      '#ef4444', // red for 80-90%
      '#8b5cf6', // purple for >90%
    ];

    return [
      {
        value: intensityDistribution.below60,
        color: colorArray[0],
        label: '<60%',
        text: `${intensityDistribution.below60}`,
        textColor: colors.white,
        textBackgroundColor: colorArray[0],
      },
      {
        value: intensityDistribution.between60and70,
        color: colorArray[1],
        label: '60-70%',
        text: `${intensityDistribution.between60and70}`,
        textColor: colors.white,
        textBackgroundColor: colorArray[1],
      },
      {
        value: intensityDistribution.between70and80,
        color: colorArray[2],
        label: '70-80%',
        text: `${intensityDistribution.between70and80}`,
        textColor: colors.white,
        textBackgroundColor: colorArray[2],
      },
      {
        value: intensityDistribution.between80and90,
        color: colorArray[3],
        label: '80-90%',
        text: `${intensityDistribution.between80and90}`,
        textColor: colors.white,
        textBackgroundColor: colorArray[3],
      },
      {
        value: intensityDistribution.above90,
        color: colorArray[4],
        label: '>90%',
        text: `${intensityDistribution.above90}`,
        textColor: colors.white,
        textBackgroundColor: colorArray[4],
      },
    ].filter((item) => item.value > 0);
  }, [intensityDistribution]);

  const totalSets = useMemo(() => {
    return (
      intensityDistribution.below60 +
      intensityDistribution.between60and70 +
      intensityDistribution.between70and80 +
      intensityDistribution.between80and90 +
      intensityDistribution.above90
    );
  }, [intensityDistribution]);

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
              backgroundColor={`${colors.niceOrange}20`}
              alignItems="center"
              justifyContent="center"
            >
              <PieChart size={32} color={colors.niceOrange} />
            </YStack>
            <YStack flex={1} space="$1">
              <Text color="$textPrimary" fontSize="$7" fontWeight="700">
                {t('progress.intensityDistribution')}
              </Text>
            </YStack>
          </XStack>
          <Text color="$textSecondary" fontSize="$4">
            {t('progress.intensityDistributionDescription')}
          </Text>
        </YStack>

        <YStack padding="$4" backgroundColor={colors.midGray} borderRadius="$4" space="$3">
          <XStack alignItems="center" justifyContent="space-between" marginBottom="$2" space="$3">
            <YStack flex={1}>
              <Text color="$textPrimary" fontSize="$5" fontWeight="600">
                {selectedExercise.name} - {t('progress.intensityDistribution')}
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
            availableFilters={['week', 'month', '3months', '6months', 'year', 'all', 'custom']}
          />

          {totalSets === 0 ? (
            <YStack padding="$4" alignItems="center" space="$2">
              <Text color="$textSecondary" fontSize="$4">
                {t('progress.noDataAvailable')}
              </Text>
              <Text color="$textSecondary" fontSize="$3">
                {t('progress.noDataAvailableDescription')}
              </Text>
            </YStack>
          ) : (
            <>
              <View
                style={{
                  alignItems: 'center',
                  marginVertical: 16,
                }}
              >
                <PieChartComponent
                  data={pieData}
                  radius={120}
                  textColor={colors.white}
                  textSize={14}
                  showText
                  textBackgroundRadius={20}
                  focusOnPress
                  showValuesAsLabels
                  labelsPosition="outward"
                />
              </View>

              {/* Legend */}
              <YStack space="$2" marginTop="$4">
                <Text color="$textPrimary" fontSize="$5" fontWeight="600" marginBottom="$2">
                  {t('progress.intensityBreakdown')}
                </Text>
                {pieData.map((item, index) => {
                  const percentage =
                    totalSets > 0 ? ((item.value / totalSets) * 100).toFixed(1) : '0';
                  return (
                    <XStack key={index} alignItems="center" space="$3" paddingVertical="$2">
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          backgroundColor: item.color,
                        }}
                      />
                      <YStack flex={1}>
                        <Text color="$textPrimary" fontSize="$4">
                          {item.label}
                        </Text>
                        <Text color="$textSecondary" fontSize="$3">
                          {item.value} {t('progress.sets')} ({percentage}%)
                        </Text>
                      </YStack>
                    </XStack>
                  );
                })}
                <YStack
                  marginTop="$2"
                  padding="$3"
                  backgroundColor={colors.darkGray}
                  borderRadius="$3"
                >
                  <Text color="$textPrimary" fontSize="$4" fontWeight="600">
                    {t('progress.totalSets')}: {totalSets}
                  </Text>
                </YStack>
              </YStack>
            </>
          )}
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

export default function IntensityDistributionScreen() {
  const { workouts, isLoading, isError, refetch } = useValidatedWorkouts();

  if (isLoading) {
    return <LoadingView />;
  }

  if (isError) {
    return <ErrorView onRetry={refetch} />;
  }

  return <IntensityDistributionChart workouts={workouts} />;
}
