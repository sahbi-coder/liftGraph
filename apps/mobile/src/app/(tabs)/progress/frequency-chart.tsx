import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, View, Dimensions, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { YStack, XStack, Text, Button } from 'tamagui';
import { BarChart3 } from '@tamagui/lucide-icons';
import { BarChart } from 'react-native-gifted-charts';
import dayjs from 'dayjs';

import { colors } from '@/theme/colors';
import { Calendar } from '@/components/Calendar';
import { LoadingView, ErrorView } from '@/components/StatusViews';
import { useUserWorkouts } from '@/hooks/useUserWorkouts';
import type { Workout } from '@/services/firestore';
import type { ExerciseSelection } from '@/app/(tabs)/workout/types';
import { setExercisePickerCallback } from '@/app/(tabs)/workout/exercisePickerContext';
import { buildWeeklyExerciseFrequencyByWeek } from '@/utils/strength';

const screenWidth = Dimensions.get('window').width;

type FilterType = 'month' | '3months' | '6months' | 'year' | 'all' | 'custom';

type WeeklyFrequencyChartProps = {
  workouts: Workout[];
};

function WeeklyFrequencyChart({ workouts: _workouts }: WeeklyFrequencyChartProps) {
  const router = useRouter();
  const [selectedExercise, setSelectedExercise] = useState<{ id: string; name: string }>({
    id: 'squat',
    name: 'Squat',
  });
  const [filterType, setFilterType] = useState<FilterType>('month');
  const [customStartDate, setCustomStartDate] = useState<string | null>(null);
  const [customEndDate, setCustomEndDate] = useState<string | null>(null);
  const [isCustomRangeModalVisible, setIsCustomRangeModalVisible] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<string | null>(null);
  const [tempEndDate, setTempEndDate] = useState<string | null>(null);

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
              backgroundColor="#8b5cf620"
              alignItems="center"
              justifyContent="center"
            >
              <BarChart3 size={32} color="#8b5cf6" />
            </YStack>
            <YStack flex={1} space="$1">
              <Text color="$textPrimary" fontSize="$7" fontWeight="700">
                Workout Frequency
              </Text>
            </YStack>
          </XStack>
          <Text color="$textSecondary" fontSize="$4">
            Sessions per week for a given lift. Highlights how consistently you are training each
            movement over time.
          </Text>
        </YStack>

        <YStack padding="$4" backgroundColor={colors.midGray} borderRadius="$4" space="$3">
          <XStack alignItems="center" justifyContent="space-between" marginBottom="$2" space="$3">
            <YStack flex={1}>
              <Text color="$textPrimary" fontSize="$5" fontWeight="600">
                {selectedExercise.name} - Weekly Frequency
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
              backgroundColor={filterType === 'month' ? colors.niceOrange : colors.darkGray}
              color={colors.white}
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
              color={colors.white}
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
              color={colors.white}
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
              color={colors.white}
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
              color={colors.white}
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
              color={colors.white}
              fontSize="$3"
              borderRadius="$3"
              paddingHorizontal="$3"
              paddingVertical="$2"
              onPress={handleOpenCustomRange}
            >
              Custom Range
            </Button>
          </XStack>

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

export default function FrequencyChartScreen() {
  const { workouts, isLoading, isError, refetch } = useUserWorkouts();

  if (isLoading) {
    return <LoadingView />;
  }

  if (isError) {
    return <ErrorView onRetry={refetch} />;
  }

  const validatedWorkouts = (workouts ?? []).filter((workout) => workout.validated);

  return <WeeklyFrequencyChart workouts={validatedWorkouts} />;
}
