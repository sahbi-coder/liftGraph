import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { PieChart } from '@tamagui/lucide-icons';
import { PieChart as PieChartComponent } from 'react-native-gifted-charts';

import { colors } from '@/theme/colors';
import { LoadingView, ErrorView } from '@/components/StatusViews';
import { CustomRangeModal } from '@/components/progress/CustomRangeModal';
import { DurationFilterButtons } from '@/components/progress/DurationFilterButtons';
import { useValidatedWorkouts } from '@/hooks/workout/useValidatedWorkouts';
import { useDateRangeFilter } from '@/hooks/common/useDateRangeFilter';
import { useExercises } from '@/hooks/exercise/useExercises';
import type { Workout, Exercise } from '@/services';
import { calculateMuscleGroupVolume } from '@/utils/strength';
import { useTranslation } from '@/hooks/common/useTranslation';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { weightForDisplay } from '@/utils/units';

type MuscleGroupVolumeChartProps = {
  workouts: Workout[];
  exercises: Exercise[] | undefined;
};

function MuscleGroupVolumeChart({
  workouts: _workouts,
  exercises: _exercises,
}: MuscleGroupVolumeChartProps) {
  const { preferences } = useUserPreferences();
  const weightUnit = preferences?.weightUnit ?? 'kg';
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
    defaultFilter: '3months',
  });

  // Create a map of exerciseId -> bodyPart for quick lookup
  const exerciseMap = useMemo(() => {
    if (!_exercises) return new Map<string, { bodyPart: string }>();
    const map = new Map<string, { bodyPart: string }>();
    _exercises.forEach((exercise) => {
      map.set(exercise.id, { bodyPart: exercise.bodyPart });
    });
    return map;
  }, [_exercises]);

  // Calculate muscle group volume distribution
  const muscleGroupVolume = useMemo(() => {
    if (!_exercises || _exercises.length === 0) {
      return {};
    }
    return calculateMuscleGroupVolume(
      _workouts,
      exerciseMap,
      dateRange.startDate.toDate(),
      dateRange.endDate.toDate(),
    );
  }, [_workouts, exerciseMap, dateRange.startDate, dateRange.endDate, _exercises]);

  // Prepare pie chart data
  const pieData = useMemo(() => {
    const entries = Object.entries(muscleGroupVolume);
    if (entries.length === 0) {
      return [];
    }

    // Sort by volume descending
    const sortedEntries = entries.sort((a, b) => b[1] - a[1]);

    // Color palette for muscle groups - distinct colors for easy differentiation
    const colorPalette = [
      '#e74c3c', // bright red
      '#3498db', // bright blue
      '#2ecc71', // emerald green
      '#f39c12', // orange
      '#9b59b6', // purple
      '#1abc9c', // turquoise
      '#e67e22', // dark orange
      '#34495e', // dark blue-gray
      '#f1c40f', // yellow
      '#e91e63', // pink
      '#00bcd4', // cyan
      '#4caf50', // green
      '#ff9800', // deep orange
      '#673ab7', // deep purple
      '#009688', // teal
    ];

    return sortedEntries.map(([bodyPart, volume], index) => {
      const displayVolume = weightForDisplay(volume, weightUnit);
      // Translate body part name - use lowercase for translation key
      const translatedBodyPart = t(`exercise.${bodyPart.toLowerCase()}`);
      return {
        value: volume,
        color: colorPalette[index % colorPalette.length],
        label: translatedBodyPart,
        bodyPartKey: bodyPart, // Keep original for reference
        text: `${displayVolume.toFixed(0)}`,
        textColor: colors.white,
        textBackgroundColor: colorPalette[index % colorPalette.length],
      };
    });
  }, [muscleGroupVolume, weightUnit, t]);

  const totalVolume = useMemo(() => {
    return Object.values(muscleGroupVolume).reduce((sum, volume) => sum + volume, 0);
  }, [muscleGroupVolume]);

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
                {t('progress.muscleGroupVolumeBalance')}
              </Text>
            </YStack>
          </XStack>
          <Text color="$textSecondary" fontSize="$4">
            {t('progress.muscleGroupVolumeBalanceDescription')}
          </Text>
        </YStack>

        <YStack padding="$4" backgroundColor={colors.midGray} borderRadius="$4" space="$3">
          <YStack marginBottom="$2">
            <Text color="$textPrimary" fontSize="$5" fontWeight="600">
              {t('progress.muscleGroupVolumeBalance')}
            </Text>
            <Text color="$textSecondary" fontSize="$3">
              {dateRangeDisplay}
            </Text>
          </YStack>

          <DurationFilterButtons
            filterType={filterType}
            onFilterChange={handleQuickFilter}
            onCustomRangePress={handleOpenCustomRange}
            availableFilters={['week', 'month', '3months', '6months', 'year', 'all', 'custom']}
          />

          {totalVolume === 0 || pieData.length === 0 ? (
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
                  {t('progress.muscleGroupBreakdown')}
                </Text>
                {pieData.map((item, index) => {
                  const percentage =
                    totalVolume > 0 ? ((item.value / totalVolume) * 100).toFixed(1) : '0';
                  const displayVolume = weightForDisplay(item.value, weightUnit);
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
                          {displayVolume.toFixed(0)}{' '}
                          {weightUnit === 'lb' ? t('common.unitLbs') : t('common.unitKg')} (
                          {percentage}%)
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
                    {t('progress.totalVolume')}:{' '}
                    {weightForDisplay(totalVolume, weightUnit).toFixed(0)}{' '}
                    {weightUnit === 'lb' ? t('common.unitLbs') : t('common.unitKg')}
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

export default function MuscleGroupVolumeScreen() {
  const {
    workouts,
    isLoading: workoutsLoading,
    isError: workoutsError,
    refetch: refetchWorkouts,
  } = useValidatedWorkouts();
  const {
    exercises,
    isLoading: exercisesLoading,
    isError: exercisesError,
    refetch: refetchExercises,
  } = useExercises();

  const isLoading = workoutsLoading || exercisesLoading;
  const isError = workoutsError || exercisesError;

  if (isLoading) {
    return <LoadingView />;
  }

  if (isError) {
    return (
      <ErrorView
        onRetry={() => {
          refetchWorkouts();
          refetchExercises();
        }}
      />
    );
  }

  return <MuscleGroupVolumeChart workouts={workouts} exercises={exercises} />;
}
