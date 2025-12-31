import React, { useMemo } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import { PieChart, X } from '@tamagui/lucide-icons';
import { PieChart as PieChartComponent } from 'react-native-gifted-charts';

import { colors } from '@/theme/colors';
import { LoadingView, ErrorView } from '@/components/StatusViews';
import { CustomRangeModal } from '@/components/progress/CustomRangeModal';
import { DurationFilterButtons } from '@/components/progress/DurationFilterButtons';
import { useValidatedWorkouts } from '@/hooks/workout/useValidatedWorkouts';
import { useDateRangeFilter } from '@/hooks/common/useDateRangeFilter';
import { useMultipleExerciseSelection } from '@/hooks/exercise/useMultipleExerciseSelection';
import type { Workout } from '@/services';
import { calculateExerciseVolume } from '@/utils/strength';
import { useTranslation } from '@/hooks/common/useTranslation';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { weightForDisplay } from '@/utils/units';

type LiftVolumeComparisonChartProps = {
  workouts: Workout[];
};

function LiftVolumeComparisonChart({ workouts: _workouts }: LiftVolumeComparisonChartProps) {
  const { preferences } = useUserPreferences();
  const weightUnit = preferences?.weightUnit ?? 'kg';
  const { t } = useTranslation();

  const { selectedExercises, handleOpenExercisePicker, removeExercise } =
    useMultipleExerciseSelection({
      defaultExercises: [],
      exercisePickerPath: '/(tabs)/progress/exercises',
      filterByLoad: true, // Only show weighted exercises
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

  // Calculate exercise volume distribution
  const exerciseVolume = useMemo(() => {
    if (selectedExercises.length === 0) {
      return {};
    }
    const exerciseIds = selectedExercises.map((ex) => ex.id);
    return calculateExerciseVolume(
      _workouts,
      exerciseIds,
      dateRange.startDate.toDate(),
      dateRange.endDate.toDate(),
    );
  }, [_workouts, selectedExercises, dateRange.startDate, dateRange.endDate]);

  // Prepare pie chart data
  const pieData = useMemo(() => {
    if (selectedExercises.length === 0) {
      return [];
    }

    // Create entries with exercise names
    const entries = selectedExercises
      .map((exercise) => ({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        volume: exerciseVolume[exercise.id] || 0,
      }))
      .filter((entry) => entry.volume > 0)
      .sort((a, b) => b.volume - a.volume);

    if (entries.length === 0) {
      return [];
    }

    // Color palette for exercises - distinct colors for easy differentiation
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

    return entries.map((entry, index) => {
      const displayVolume = weightForDisplay(entry.volume, weightUnit);
      return {
        value: entry.volume,
        color: colorPalette[index % colorPalette.length],
        label: entry.exerciseName,
        exerciseId: entry.exerciseId,
        text: `${displayVolume.toFixed(0)}`,
        textColor: colors.white,
        textBackgroundColor: colorPalette[index % colorPalette.length],
      };
    });
  }, [exerciseVolume, selectedExercises, weightUnit]);

  const totalVolume = useMemo(() => {
    return Object.values(exerciseVolume).reduce((sum, volume) => sum + volume, 0);
  }, [exerciseVolume]);

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
                {t('progress.liftVolumeComparison')}
              </Text>
            </YStack>
          </XStack>
          <Text color="$textSecondary" fontSize="$4">
            {t('progress.liftVolumeComparisonDescription')}
          </Text>
        </YStack>

        <YStack padding="$4" backgroundColor={colors.midGray} borderRadius="$4" space="$3">
          <YStack marginBottom="$2" space="$2">
            <Text color="$textPrimary" fontSize="$5" fontWeight="600">
              {t('progress.liftVolumeComparison')}
            </Text>
            <Text color="$textSecondary" fontSize="$3">
              {dateRangeDisplay}
            </Text>
          </YStack>

          {/* Selected Exercises */}
          <YStack space="$2" marginBottom="$3">
            <XStack alignItems="center" justifyContent="space-between">
              <Text color="$textPrimary" fontSize="$4" fontWeight="600">
                {t('progress.selectedLifts')}
              </Text>
              <Button
                size="$3"
                backgroundColor={colors.darkGray}
                color={colors.white}
                borderRadius="$3"
                paddingHorizontal="$3"
                paddingVertical="$2"
                onPress={handleOpenExercisePicker}
              >
                {t('progress.addLift')}
              </Button>
            </XStack>
            {selectedExercises.length === 0 ? (
              <Text color="$textSecondary" fontSize="$3" paddingVertical="$2">
                {t('progress.noLiftsSelected')}
              </Text>
            ) : (
              <YStack space="$2">
                {selectedExercises.map((exercise) => (
                  <XStack
                    key={exercise.id}
                    alignItems="center"
                    justifyContent="space-between"
                    padding="$2"
                    backgroundColor={colors.darkGray}
                    borderRadius="$3"
                  >
                    <Text color="$textPrimary" fontSize="$4">
                      {exercise.name}
                    </Text>
                    <Pressable onPress={() => removeExercise(exercise.id)}>
                      <X size={20} color={colors.white} />
                    </Pressable>
                  </XStack>
                ))}
              </YStack>
            )}
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
                {t('progress.noVolumeDataDescription')}
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
                  {t('progress.volumeBreakdown')}
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

export default function LiftVolumeComparisonScreen() {
  const { workouts, isLoading, isError, refetch } = useValidatedWorkouts();

  if (isLoading) {
    return <LoadingView />;
  }

  if (isError) {
    return <ErrorView onRetry={refetch} />;
  }

  return <LiftVolumeComparisonChart workouts={workouts} />;
}
