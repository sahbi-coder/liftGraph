import React from 'react';
import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { YStack, Text, XStack, Button } from 'tamagui';

import type { Program, ProgramDayLabel, ProgramExercise } from '@/services';
import { colors } from '@/theme/colors';
import { DaySelector } from '@/components/DaySelector';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { useTranslation } from '@/hooks/common/useTranslation';

type ProgramDetailsProps = {
  program: Program;
  programId: string;
  selectedAlternatingWeek: 0 | 1;
  onSelectAlternatingWeek: (week: 0 | 1) => void;
  activeDays: ProgramDayLabel[];
  activeDayExercises: {
    dayNumber: number;
    dayLabel: ProgramDayLabel;
    dayName?: string;
    exercises: ProgramExercise[];
  }[];
  onApplyDay: (exercises: ProgramExercise[]) => void;
  onDeleteProgram: () => void;
  isDeleting: boolean;
  isDeleteModalVisible: boolean;
  onCloseDeleteModal: () => void;
  onConfirmDelete: () => void;
};

export function ProgramDetails({
  program,
  programId,
  selectedAlternatingWeek,
  onSelectAlternatingWeek,
  activeDays,
  activeDayExercises,
  onApplyDay,
  onDeleteProgram,
  isDeleting,
  isDeleteModalVisible,
  onCloseDeleteModal,
  onConfirmDelete,
}: ProgramDetailsProps) {
  const router = useRouter();
  const { t } = useTranslation();

  // Helper function to translate day labels
  const getTranslatedDayLabel = (dayLabel: ProgramDayLabel): string => {
    const dayNumber = dayLabel.replace('Day', '');
    return `${t('common.day')} ${dayNumber}`;
  };

  // Get program type label
  const getProgramTypeLabel = () => {
    if (program.type === 'simple') {
      return t('program.simpleProgram');
    } else if (program.type === 'alternating') {
      return t('program.alternatingProgram');
    } else {
      return t('program.advancedProgram');
    }
  };

  // Get schedule label
  const getScheduleLabel = () => {
    if (program.type === 'simple') {
      return t('program.weeklySchedule');
    } else {
      return t('program.alternatingWeeks');
    }
  };

  // Render exercise set details
  const renderExerciseSet = (set: { reps: number; rir: number }, setIndex: number) => (
    <YStack key={setIndex} space="$1">
      <Text color="$textSecondary" fontSize="$2">
        {t('common.set')} {setIndex + 1}
      </Text>
      <XStack gap="$3">
        <YStack space="$0.5">
          <Text color="$textSecondary" fontSize="$2">
            {t('common.reps')}
          </Text>
          <Text color={colors.white} fontSize="$3" fontWeight="500">
            {set.reps}
          </Text>
        </YStack>
        <YStack space="$0.5">
          <Text color="$textSecondary" fontSize="$2">
            {t('workout.rir')}
          </Text>
          <Text color={colors.white} fontSize="$3" fontWeight="500">
            {set.rir}
          </Text>
        </YStack>
      </XStack>
    </YStack>
  );

  // Render exercise card
  const renderExercise = (exercise: ProgramExercise, exerciseIndex: number) => (
    <YStack
      key={exerciseIndex}
      padding="$3"
      backgroundColor={colors.darkGray}
      borderRadius="$3"
      space="$2"
    >
      <Text color={colors.white} fontSize="$4" fontWeight="600">
        {exercise.name}
      </Text>
      <XStack gap="$3" flexWrap="wrap">
        <YStack space="$1">
          <Text color="$textSecondary" fontSize="$2">
            {t('common.sets')}
          </Text>
          <Text color={colors.white} fontSize="$3" fontWeight="500">
            {exercise.sets.length}
          </Text>
        </YStack>
        {exercise.sets.map((set, setIndex) => renderExerciseSet(set, setIndex))}
      </XStack>
    </YStack>
  );

  // Render day section
  const renderDaySection = (
    dayData: {
      dayNumber: number;
      dayLabel: ProgramDayLabel;
      dayName?: string;
      exercises: ProgramExercise[];
    },
    index: number,
  ) => (
    <YStack key={index} space="$2">
      <XStack alignItems="center" justifyContent="space-between" gap="$2" flexWrap="wrap">
        <YStack space="$1" flex={1}>
          <Text color="$textPrimary" fontSize="$5" fontWeight="600">
            {getTranslatedDayLabel(dayData.dayLabel)}{' '}
            {dayData.dayName ? `(${dayData.dayName})` : ''}
          </Text>
          <Text color="$textSecondary" fontSize="$4">
            {dayData.exercises.length}{' '}
            {dayData.exercises.length !== 1 ? t('common.exercises') : t('common.exercise')}
          </Text>
        </YStack>
        <Button
          backgroundColor={colors.niceOrange}
          color={colors.white}
          fontSize="$4"
          fontWeight="600"
          borderRadius="$3"
          borderWidth={0}
          paddingHorizontal="$2.5"
          paddingVertical="$1.5"
          onPress={() => onApplyDay(dayData.exercises)}
        >
          {t('program.applyDay')}
        </Button>
      </XStack>
      <YStack padding="$3" backgroundColor={colors.midGray} borderRadius="$4" space="$2">
        {dayData.exercises.map((exercise, exerciseIndex) =>
          renderExercise(exercise, exerciseIndex),
        )}
      </YStack>
    </YStack>
  );

  // Render simple/alternating program view
  const renderSimpleOrAlternatingView = () => (
    <YStack space="$3">
      <Text color="$textPrimary" fontSize="$6" fontWeight="600">
        {getScheduleLabel()}
      </Text>
      {program.type === 'alternating' && (
        <XStack space="$2" alignItems="center">
          <Button
            backgroundColor={selectedAlternatingWeek === 0 ? '$primaryButton' : colors.midGray}
            color={colors.white}
            fontSize="$4"
            borderRadius="$4"
            fontWeight="600"
            borderWidth={0}
            paddingHorizontal="$3"
            paddingVertical="$2"
            onPress={() => onSelectAlternatingWeek(0)}
          >
            {t('program.week1')}
          </Button>
          <Button
            backgroundColor={selectedAlternatingWeek === 1 ? '$primaryButton' : colors.midGray}
            color={colors.white}
            fontSize="$4"
            borderRadius="$4"
            fontWeight="600"
            borderWidth={0}
            paddingHorizontal="$3"
            paddingVertical="$2"
            onPress={() => onSelectAlternatingWeek(1)}
          >
            {t('program.week2')}
          </Button>
        </XStack>
      )}
      <DaySelector value={activeDays} disabled />
      {activeDayExercises.length > 0 && (
        <YStack space="$3" marginTop="$2">
          {activeDayExercises.map((dayData, index) => renderDaySection(dayData, index))}
        </YStack>
      )}
    </YStack>
  );

  // Render advanced program view
  const renderAdvancedView = () => {
    if (program.type !== 'advanced') {
      return null;
    }

    return (
      <YStack space="$4">
        <Text color="$textPrimary" fontSize="$6" fontWeight="600">
          {t('program.programPhases')}
        </Text>
        {program.phases.map((phase, phaseIndex) => (
          <YStack
            key={phaseIndex}
            padding="$3"
            backgroundColor={colors.midGray}
            borderRadius="$4"
            space="$3"
            marginBottom="$4"
          >
            <YStack space="$1">
              <Text color="$textPrimary" fontSize="$5" fontWeight="600">
                {phase.name}
              </Text>
              {phase.description && (
                <Text color="$textSecondary" fontSize="$4">
                  {phase.description}
                </Text>
              )}
            </YStack>
            {phase.weeks.map((week, weekIndex) => {
              const weekActiveDays = week.days
                .map((day: (typeof week.days)[number], index: number) =>
                  day !== 'rest' ? `Day${index + 1}` : null,
                )
                .filter((day): day is ProgramDayLabel => day !== null);

              const weekActiveDayExercises = week.days
                .map((day: (typeof week.days)[number], index: number) => {
                  if (day === 'rest') return null;
                  return {
                    dayNumber: index + 1,
                    dayLabel: day.label,
                    dayName: day.name,
                    exercises: day.exercises,
                  };
                })
                .filter((item): item is NonNullable<typeof item> => item !== null);

              return (
                <YStack key={weekIndex} space="$3" marginBottom="$3">
                  <YStack
                    padding="$3"
                    backgroundColor={colors.darkGray}
                    borderRadius="$3"
                    borderWidth={1}
                    borderColor={colors.niceOrange}
                    space="$2"
                  >
                    <XStack alignItems="center" space="$2">
                      <Text color={colors.niceOrange} fontSize="$6" fontWeight="700">
                        {t('common.week')} {weekIndex + 1}
                      </Text>
                      {phase.weeks.length > 1 && (
                        <Text color="$textSecondary" fontSize="$3">
                          ({t('common.of')} {phase.weeks.length} {t('common.weeks')})
                        </Text>
                      )}
                      {week.name && (
                        <Text color="$textSecondary" fontSize="$3">
                          ({week.name})
                        </Text>
                      )}
                    </XStack>
                    <DaySelector value={weekActiveDays} disabled />
                  </YStack>
                  {weekActiveDayExercises.length > 0 && (
                    <YStack space="$3">
                      {weekActiveDayExercises.map((dayData, dayIndex) =>
                        renderDaySection(dayData, dayIndex),
                      )}
                    </YStack>
                  )}
                </YStack>
              );
            })}
          </YStack>
        ))}
      </YStack>
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.darkerGray }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
    >
      <YStack space="$4">
        {/* Program Header */}
        <YStack space="$2">
          <XStack alignItems="center" justifyContent="space-between" gap="$2" flexWrap="wrap">
            <Text color="$textPrimary" fontSize="$9" fontWeight="700" flex={1}>
              {program.name}
            </Text>
            <Button
              backgroundColor={colors.niceOrange}
              color={colors.white}
              fontSize="$4"
              borderRadius="$4"
              borderWidth={0}
              paddingHorizontal="$3"
              paddingVertical="$2"
              onPress={() => router.push(`/program/edit?id=${programId}`)}
            >
              {t('program.updateProgram')}
            </Button>
          </XStack>
          {program.description && (
            <Text color="$textSecondary" fontSize="$5">
              {program.description}
            </Text>
          )}
          <XStack alignItems="center" space="$2">
            <Button
              disabled
              backgroundColor="rgba(249, 115, 22, 0.5)"
              color={colors.niceOrange}
              fontSize="$4"
              borderRadius="$4"
              borderWidth={0}
              cursor="default"
              height="auto"
              paddingHorizontal="$2"
              fontWeight="600"
              paddingVertical="$1"
            >
              {getProgramTypeLabel()}
            </Button>
            {(program.type === 'simple' || program.type === 'alternating') && (
              <Button
                disabled
                backgroundColor={colors.midGray}
                color="$textPrimary"
                fontSize="$4"
                fontWeight="600"
                paddingVertical="$1"
                paddingHorizontal="$2"
                borderWidth={0}
                cursor="default"
                height="auto"
              >
                {getScheduleLabel()}
              </Button>
            )}
          </XStack>
        </YStack>

        {/* Program Content */}
        {program.type === 'simple' || program.type === 'alternating'
          ? renderSimpleOrAlternatingView()
          : renderAdvancedView()}

        {/* Delete Button */}
        <YStack
          space="$3"
          marginTop="$4"
          paddingTop="$4"
          borderTopWidth={1}
          borderTopColor={colors.midGray}
        >
          <Button
            backgroundColor={colors.midGray}
            color="#ef4444"
            fontSize="$4"
            borderRadius="$4"
            borderWidth={0}
            paddingHorizontal="$3"
            paddingVertical="$2"
            onPress={onDeleteProgram}
            disabled={isDeleting}
            opacity={isDeleting ? 0.5 : 1}
            alignSelf="center"
          >
            {isDeleting ? t('common.deleting') : t('program.deleteProgram')}
          </Button>
        </YStack>
      </YStack>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={isDeleteModalVisible}
        title={t('program.deleteProgramConfirm')}
        message={t('program.deleteProgramMessage', { name: program.name || '' })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={onConfirmDelete}
        onCancel={onCloseDeleteModal}
        confirmButtonColor="#ef4444"
        cancelButtonColor={colors.midGray}
      />
    </ScrollView>
  );
}
