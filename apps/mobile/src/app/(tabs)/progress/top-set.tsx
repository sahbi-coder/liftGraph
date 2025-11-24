import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, View, Dimensions, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { YStack, XStack, Text, Button } from 'tamagui';
import { Activity } from '@tamagui/lucide-icons';
import { LineChart } from 'react-native-gifted-charts';
import dayjs from 'dayjs';

import { colors } from '@/theme/colors';
import { Calendar } from '@/components/Calendar';
import { LoadingView, ErrorView } from '@/components/StatusViews';
import { useUserWorkouts } from '@/hooks/useUserWorkouts';
import type { Workout } from '@/services/firestore';
import type { ExerciseSelection } from '@/app/(tabs)/workout/types';
import { setExercisePickerCallback } from '@/app/(tabs)/workout/exercisePickerContext';
import { buildWorkoutTopSets } from '@/utils/strength';

const screenWidth = Dimensions.get('window').width;

type FilterType = 'week' | 'month' | '3months' | '6months' | 'year' | 'all' | 'custom';

type PointerLabelItem = {
  value: number;
  label: string;
  reps: number;
  // allow extra properties from the chart library without strict typing
  [key: string]: unknown;
};

type TopSetProgressionChartProps = {
  workouts: Workout[];
};

function TopSetProgressionChart({ workouts: _workouts }: TopSetProgressionChartProps) {
  const router = useRouter();
  const [selectedExercise, setSelectedExercise] = useState<{ id: string; name: string }>({
    id: 'squat',
    name: 'Squat',
  });
  const [filterType, setFilterType] = useState<FilterType>('3months');
  const [customStartDate, setCustomStartDate] = useState<string | null>(null);
  const [customEndDate, setCustomEndDate] = useState<string | null>(null);
  const [isCustomRangeModalVisible, setIsCustomRangeModalVisible] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<string | null>(null);
  const [tempEndDate, setTempEndDate] = useState<string | null>(null);
  const [pointSpacing, setPointSpacing] = useState(40); // horizontal spacing (months/dates)

  const handleExerciseSelect = useCallback((exercise: ExerciseSelection) => {
    setSelectedExercise({ id: exercise.id, name: exercise.name });
  }, []);

  const handleOpenExercisePicker = useCallback(() => {
    setExercisePickerCallback(handleExerciseSelect);
    router.push('/(tabs)/progress/exercises');
  }, [handleExerciseSelect, router]);

  // Build top-set series for the selected exercise from workout data
  const topSetSeries = useMemo(() => {
    const allTopSets = buildWorkoutTopSets(_workouts);

    return allTopSets
      .filter((point) => point.exerciseId === selectedExercise.id)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [_workouts, selectedExercise.id]);

  // Calculate date range based on filter type
  const dateRange = useMemo(() => {
    const today = dayjs();
    let startDate: dayjs.Dayjs;
    let endDate: dayjs.Dayjs = today;

    if (filterType === 'custom') {
      if (customStartDate && customEndDate) {
        startDate = dayjs(customStartDate);
        endDate = dayjs(customEndDate);
      } else {
        // Default to last 3 months if custom not set
        startDate = today.subtract(3, 'month');
      }
    } else {
      switch (filterType) {
        case 'week':
          startDate = today.subtract(1, 'week');
          break;
        case 'month':
          startDate = today.subtract(1, 'month');
          break;
        case '3months':
          startDate = today.subtract(3, 'month');
          break;
        case '6months':
          startDate = today.subtract(6, 'month');
          break;
        case 'year':
          startDate = today.subtract(1, 'year');
          break;
        case 'all':
        default:
          startDate = topSetSeries.length
            ? dayjs(topSetSeries[0].date)
            : today.subtract(3, 'month');
          break;
      }
    }

    return { startDate, endDate };
  }, [filterType, customStartDate, customEndDate, topSetSeries]);

  // Filter series based on date range and adapt to chart data format
  const filteredData = useMemo(() => {
    return topSetSeries
      .filter((point) => {
        const itemDate = dayjs(point.date);
        return (
          itemDate.isAfter(dateRange.startDate.subtract(1, 'day')) &&
          itemDate.isBefore(dateRange.endDate.add(1, 'day'))
        );
      })
      .map((point) => ({
        value: point.set.weight,
        label: dayjs(point.date).format('MMM D'),
        reps: point.set.reps,
        labelTextStyle: { color: colors.white, fontSize: 10 },
      }));
  }, [topSetSeries, dateRange]);

  // Determine a reasonable max value for the y-axis in kg
  const maxYValue = useMemo(() => {
    if (!filteredData.length) return 100;
    const maxVal = Math.max(...filteredData.map((d) => d.value));
    // Round up to nearest 10 for a cleaner axis
    return Math.ceil(maxVal / 10) * 10;
  }, [filteredData]);

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
    setTempStartDate(customStartDate);
    setTempEndDate(customEndDate);
    setIsCustomRangeModalVisible(true);
  }, [customStartDate, customEndDate]);

  const handleApplyCustomRange = useCallback(() => {
    if (tempStartDate && tempEndDate) {
      setCustomStartDate(tempStartDate);
      setCustomEndDate(tempEndDate);
      setFilterType('custom');
    }
    setIsCustomRangeModalVisible(false);
  }, [tempStartDate, tempEndDate]);

  const handleStartDateSelect = useCallback((day: { dateString: string }) => {
    setTempStartDate(day.dateString);
  }, []);

  const handleEndDateSelect = useCallback((day: { dateString: string }) => {
    setTempEndDate(day.dateString);
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
              backgroundColor="#3b82f620"
              alignItems="center"
              justifyContent="center"
            >
              <Activity size={32} color="#3b82f6" />
            </YStack>
            <YStack flex={1} space="$1">
              <Text color="$textPrimary" fontSize="$7" fontWeight="700">
                Top Set Progression Chart
              </Text>
            </YStack>
          </XStack>
          <Text color="$textSecondary" fontSize="$4">
            Track top weight × reps over time as a bubble chart. X-axis = date, Y-axis = weight,
            bubble size = reps. See progression like 405×1 → 405×3 → 420×1 → 425×1.
          </Text>
        </YStack>

        <YStack padding="$4" backgroundColor={colors.midGray} borderRadius="$4" space="$3">
          <XStack alignItems="center" justifyContent="space-between" marginBottom="$2" space="$3">
            <YStack flex={1}>
              <Text color="$textPrimary" fontSize="$5" fontWeight="600">
                {selectedExercise.name} - Top Set (heaviest)
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

          {/* Quick Filter Buttons */}
          <XStack gap="$2" flexWrap="wrap" marginBottom="$3">
            <Button
              size="$3"
              backgroundColor={filterType === 'week' ? colors.niceOrange : colors.darkGray}
              color={filterType === 'week' ? colors.white : colors.white}
              fontSize="$3"
              borderRadius="$3"
              paddingHorizontal="$3"
              paddingVertical="$2"
              onPress={() => handleQuickFilter('week')}
            >
              Last Week
            </Button>
            <Button
              size="$3"
              backgroundColor={filterType === 'month' ? colors.niceOrange : colors.darkGray}
              color={filterType === 'month' ? colors.white : colors.white}
              fontSize="$3"
              borderRadius="$3"
              paddingHorizontal="$3"
              paddingVertical="$2"
              onPress={() => handleQuickFilter('month')}
            >
              Last Month
            </Button>
            <Button
              size="$3"
              backgroundColor={filterType === '3months' ? colors.niceOrange : colors.darkGray}
              color={filterType === '3months' ? colors.white : colors.white}
              fontSize="$3"
              borderRadius="$3"
              paddingHorizontal="$3"
              paddingVertical="$2"
              onPress={() => handleQuickFilter('3months')}
            >
              3 Months
            </Button>
            <Button
              size="$3"
              backgroundColor={filterType === '6months' ? colors.niceOrange : colors.darkGray}
              color={filterType === '6months' ? colors.white : colors.white}
              fontSize="$3"
              borderRadius="$3"
              paddingHorizontal="$3"
              paddingVertical="$2"
              onPress={() => handleQuickFilter('6months')}
            >
              6 Months
            </Button>
            <Button
              size="$3"
              backgroundColor={filterType === 'year' ? colors.niceOrange : colors.darkGray}
              color={filterType === 'year' ? colors.white : colors.white}
              fontSize="$3"
              borderRadius="$3"
              paddingHorizontal="$3"
              paddingVertical="$2"
              onPress={() => handleQuickFilter('year')}
            >
              Last Year
            </Button>
            <Button
              size="$3"
              backgroundColor={filterType === 'all' ? colors.niceOrange : colors.darkGray}
              color={filterType === 'all' ? colors.white : colors.white}
              fontSize="$3"
              borderRadius="$3"
              paddingHorizontal="$3"
              paddingVertical="$2"
              onPress={() => handleQuickFilter('all')}
            >
              All Time
            </Button>
            <Button
              size="$3"
              backgroundColor={filterType === 'custom' ? colors.niceOrange : colors.darkGray}
              color={filterType === 'custom' ? colors.white : colors.white}
              fontSize="$3"
              borderRadius="$3"
              paddingHorizontal="$3"
              paddingVertical="$2"
              onPress={handleOpenCustomRange}
            >
              Custom Range
            </Button>
          </XStack>

          {/* Chart Display Controls */}
          <XStack gap="$4" marginBottom="$3" flexWrap="wrap">
            <YStack gap="$2">
              <Text color="$textSecondary" fontSize="$3">
                Time scale (spacing between dates):
              </Text>
              <XStack alignItems="center" gap="$2">
                <Button
                  size="$2.5"
                  backgroundColor={colors.niceOrange}
                  color={colors.white}
                  onPress={() => setPointSpacing((prev) => Math.max(10, prev - 5))}
                >
                  -
                </Button>
                <Text color="$textPrimary" fontSize="$3">
                  {pointSpacing}
                </Text>
                <Button
                  size="$2.5"
                  color={colors.white}
                  backgroundColor={colors.niceOrange}
                  onPress={() => setPointSpacing((prev) => Math.min(80, prev + 5))}
                >
                  +
                </Button>
              </XStack>
            </YStack>
          </XStack>

          <View
            style={{
              alignItems: 'center',
              marginVertical: 16,
            }}
          >
            <LineChart
              data={filteredData}
              width={0.65 * screenWidth}
              height={220}
              color={colors.niceOrange}
              thickness={3}
              hideRules={false}
              rulesColor={colors.darkGray}
              rulesType="solid"
              yAxisColor={colors.darkGray}
              xAxisColor={colors.darkGray}
              yAxisTextStyle={{ color: colors.white }}
              xAxisLabelTextStyle={{ color: colors.white, fontSize: 10 }}
              rotateLabel
              curved
              areaChart
              startFillColor={colors.niceOrange}
              endFillColor={`${colors.niceOrange}20`}
              startOpacity={0.4}
              endOpacity={0.1}
              spacing={pointSpacing}
              initialSpacing={10}
              noOfSections={4}
              maxValue={maxYValue}
              yAxisLabelWidth={50}
              yAxisLabelSuffix=" kg"
              pointerConfig={{
                activatePointersOnLongPress: true,
                pointerStripHeight: 200,
                pointerStripColor: colors.darkGray,
                pointerStripWidth: 2,
                pointerColor: colors.niceOrange,
                radius: 5,
                // Shift label so it doesn't sit directly under the finger
                shiftPointerLabelX: 12,
                shiftPointerLabelY: 100,
                pointerLabelComponent: (items: PointerLabelItem[]) => {
                  const item = items?.[0];
                  if (!item) return null;

                  return (
                    <YStack
                      padding="$2"
                      backgroundColor={colors.darkGray}
                      borderRadius="$2"
                      alignItems="center"
                      justifyContent="center"
                      gap="$1"
                      minWidth={80}
                      minHeight={60}
                    >
                      <Text color={colors.niceOrange} fontSize="$4" fontWeight="600">
                        {Math.round(item.value)} kg
                      </Text>
                      {typeof item.reps === 'number' && (
                        <Text color={colors.white} fontSize="$3">
                          {item.reps} reps
                        </Text>
                      )}
                      <Text color={colors.white} fontSize="$3">
                        {item.label}
                      </Text>
                    </YStack>
                  );
                },
              }}
            />
          </View>
        </YStack>

        {/* Custom Date Range Modal */}
        <Modal
          visible={isCustomRangeModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIsCustomRangeModalVisible(false)}
        >
          <YStack
            flex={1}
            backgroundColor="rgba(0, 0, 0, 0.6)"
            justifyContent="center"
            alignItems="center"
            padding="$4"
          >
            <YStack
              width="90%"
              maxWidth={420}
              maxHeight="90%"
              backgroundColor={colors.midGray}
              borderRadius="$4"
              padding="$4"
              space="$4"
            >
              <XStack alignItems="center" justifyContent="space-between">
                <Text color={colors.white} fontSize="$5" fontWeight="600">
                  Select Date Range
                </Text>
                <Button
                  size="$2"
                  variant="outlined"
                  color={colors.white}
                  onPress={() => setIsCustomRangeModalVisible(false)}
                >
                  Close
                </Button>
              </XStack>

              <ScrollView
                style={{ maxHeight: 600 }}
                contentContainerStyle={{ gap: 16 }}
                showsVerticalScrollIndicator
              >
                <YStack space="$3">
                  <YStack space="$2">
                    <Text color={colors.white} fontSize="$4" fontWeight="600">
                      Start Date
                    </Text>
                    <Calendar
                      current={tempStartDate || undefined}
                      onDayPress={handleStartDateSelect}
                      markedDates={
                        tempStartDate
                          ? {
                              [tempStartDate]: {
                                selected: true,
                                selectedColor: colors.niceOrange,
                                selectedTextColor: colors.white,
                              },
                            }
                          : undefined
                      }
                    />
                  </YStack>

                  <YStack space="$2">
                    <Text color={colors.white} fontSize="$4" fontWeight="600">
                      End Date
                    </Text>
                    <Calendar
                      current={tempEndDate || undefined}
                      onDayPress={handleEndDateSelect}
                      markedDates={
                        tempEndDate
                          ? {
                              [tempEndDate]: {
                                selected: true,
                                selectedColor: colors.niceOrange,
                                selectedTextColor: colors.white,
                              },
                            }
                          : undefined
                      }
                    />
                  </YStack>
                </YStack>
              </ScrollView>

              <XStack space="$3" justifyContent="flex-end">
                <Button
                  backgroundColor={colors.darkGray}
                  color={colors.white}
                  borderWidth={1}
                  borderColor={colors.white}
                  onPress={() => setIsCustomRangeModalVisible(false)}
                >
                  Cancel
                </Button>
                <Button
                  backgroundColor={colors.niceOrange}
                  color={colors.white}
                  onPress={handleApplyCustomRange}
                  disabled={!tempStartDate || !tempEndDate}
                  opacity={!tempStartDate || !tempEndDate ? 0.5 : 1}
                >
                  Apply
                </Button>
              </XStack>
            </YStack>
          </YStack>
        </Modal>
      </YStack>
    </ScrollView>
  );
}

export default function TopSetProgressionScreen() {
  const { workouts, isLoading, isError, refetch } = useUserWorkouts();

  if (isLoading) {
    return <LoadingView />;
  }

  if (isError) {
    return <ErrorView onRetry={refetch} />;
  }

  const validatedWorkouts = (workouts ?? []).filter((workout) => workout.validated);

  return <TopSetProgressionChart workouts={validatedWorkouts} />;
}
