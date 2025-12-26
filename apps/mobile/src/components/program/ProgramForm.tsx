import React, { useCallback } from 'react';
import { ScrollView } from 'react-native';
import { Button, Input, Text, TextArea, XStack, YStack } from 'tamagui';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';

import { useTranslation } from '@/hooks/common/useTranslation';
import { colors } from '@/theme/colors';
import { DaySelector } from '@/components/DaySelector';
import { ProgramDayLabel } from '@/services';
import type {
  ProgramWeekForm,
  ProgramExerciseForm,
  ProgramPhaseForm,
} from '@/hooks/program/useProgramForm/types';

type ProgramFormProps = {
  programType: 'simple' | 'alternating' | 'advanced';
  name: string;
  description: string;
  weeks: ProgramWeekForm[];
  alternatingWeeks: ProgramWeekForm[];
  phases: ProgramPhaseForm[];
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setProgramType: (type: 'simple' | 'alternating' | 'advanced') => void;
  handleUpdateWeekName: (weekId: string, name: string) => void;
  handleRemoveWeek: (weekId: string) => void;
  handleAddPhase: () => void;
  handleUpdatePhaseName: (phaseId: string, value: string) => void;
  handleUpdatePhaseDescription: (phaseId: string, value: string) => void;
  handleRemovePhase: (phaseId: string) => void;
  handleAddWeekToPhase: (phaseId: string) => void;
  handleUpdateWeekNameInPhase: (phaseId: string, weekId: string, value: string) => void;
  handleRemoveWeekFromPhase: (phaseId: string, weekId: string) => void;
  handleDaySelectionChange: (
    weekId: string,
    selectedDays: ProgramDayLabel[],
    phaseId?: string,
  ) => void;
  handleUpdateDayName: (
    weekId: string,
    dayId: ProgramDayLabel,
    value: string,
    phaseId?: string,
  ) => void;
  handleOpenExercisePicker: (weekId: string, dayId: ProgramDayLabel, phaseId?: string) => void;
  handleRemoveExercise: (
    weekId: string,
    dayId: ProgramDayLabel,
    exerciseId: string,
    phaseId?: string,
  ) => void;
  handleAddSet: (
    weekId: string,
    dayId: ProgramDayLabel,
    exerciseId: string,
    phaseId?: string,
  ) => void;
  handleRemoveSet: (
    weekId: string,
    dayId: ProgramDayLabel,
    exerciseId: string,
    setId: string,
    phaseId?: string,
  ) => void;
  handleDuplicateLastSet: (
    weekId: string,
    dayId: ProgramDayLabel,
    exerciseId: string,
    phaseId?: string,
  ) => void;
  handleUpdateSetField: (
    weekId: string,
    dayId: ProgramDayLabel,
    exerciseId: string,
    setId: string,
    field: 'reps' | 'rir',
    value: string,
    phaseId?: string,
  ) => void;
  handleSave: () => void;
  isSaving: boolean;
  saveButtonText?: string;
};

export function ProgramForm({
  programType,
  name,
  description,
  weeks,
  alternatingWeeks,
  phases,
  setName,
  setDescription,
  setProgramType,
  handleUpdateWeekName,
  handleRemoveWeek,
  handleAddPhase,
  handleUpdatePhaseName,
  handleUpdatePhaseDescription,
  handleRemovePhase,
  handleAddWeekToPhase,
  handleUpdateWeekNameInPhase,
  handleRemoveWeekFromPhase,
  handleDaySelectionChange,
  handleUpdateDayName,
  handleOpenExercisePicker,
  handleRemoveExercise,
  handleAddSet,
  handleRemoveSet,
  handleUpdateSetField,
  handleDuplicateLastSet,
  handleSave,
  isSaving,
  saveButtonText,
}: ProgramFormProps) {
  const { t } = useTranslation();

  const renderExerciseCard = useCallback(
    (
      exercise: ProgramExerciseForm,
      weekId: string,
      dayId: ProgramDayLabel,
      exerciseIndex: number,
      phaseId?: string,
    ) => (
      <YStack
        key={exercise.id}
        padding="$2"
        backgroundColor={colors.midGray}
        borderRadius="$4"
        space="$3"
        marginBottom="$2"
      >
        <XStack paddingHorizontal="$2" alignItems="center" justifyContent="space-between">
          <Text color={colors.white} fontSize="$5" fontWeight="600">
            {exerciseIndex + 1}. {exercise.name}
          </Text>
          <Button
            size="$2"
            variant="outlined"
            color={colors.white}
            onPress={() => handleRemoveExercise(weekId, dayId, exercise.id, phaseId)}
          >
            <Entypo name="circle-with-cross" size={24} color={colors.niceOrange} />
          </Button>
        </XStack>

        {exercise.sets.map((set) => (
          <YStack
            key={set.id}
            space="$2"
            backgroundColor={colors.lightGray}
            padding="$2"
            borderRadius="$3"
            marginBottom="$2"
          >
            <XStack space="$2" alignItems="center">
              <Input
                flex={1}
                height={40}
                value={set.reps}
                onChangeText={(value) =>
                  handleUpdateSetField(weekId, dayId, exercise.id, set.id, 'reps', value, phaseId)
                }
                placeholder={t('common.reps')}
                keyboardType="numeric"
                borderColor="$inputFieldBorder"
                backgroundColor="$background"
                color="$textPrimary"
              />
              <Text color={colors.white}>R</Text>

              <Input
                flex={1}
                height={40}
                value={set.rir}
                onChangeText={(value) =>
                  handleUpdateSetField(weekId, dayId, exercise.id, set.id, 'rir', value, phaseId)
                }
                placeholder={t('workout.rir')}
                keyboardType="numeric"
                borderColor="$inputFieldBorder"
                backgroundColor="$background"
                color="$textPrimary"
              />
              <Text color={colors.white}>{t('workout.rir')}</Text>
              <Button
                size="$2"
                variant="outlined"
                color={colors.white}
                onPress={() => handleRemoveSet(weekId, dayId, exercise.id, set.id, phaseId)}
              >
                <AntDesign name="delete" size={24} color={colors.white} />
              </Button>
            </XStack>
          </YStack>
        ))}

        <XStack space="$2">
          <Button
            size="$3"
            flex={1}
            backgroundColor={colors.niceOrange}
            color={colors.white}
            fontWeight="600"
            borderRadius="$4"
            onPress={() => handleAddSet(weekId, dayId, exercise.id, phaseId)}
          >
            <Entypo name="circle-with-plus" size={22} color={colors.white} />
            <Text color={colors.white}>{t('common.set')}</Text>
          </Button>
          <Button
            size="$3"
            flex={1}
            backgroundColor={colors.niceOrange}
            color={colors.white}
            fontWeight="600"
            borderRadius="$4"
            onPress={() => handleDuplicateLastSet(weekId, dayId, exercise.id, phaseId)}
            disabled={exercise.sets.length === 0}
            opacity={exercise.sets.length === 0 ? 0.6 : 1}
          >
            <AntDesign name="copy1" size={22} color={colors.white} />
            <Text color={colors.white}>{t('workout.duplicate')}</Text>
          </Button>
        </XStack>
      </YStack>
    ),
    [
      handleRemoveExercise,
      handleAddSet,
      handleRemoveSet,
      handleUpdateSetField,
      handleDuplicateLastSet,
      t,
    ],
  );

  const renderWeek = useCallback(
    (week: ProgramWeekForm, weekIndex: number, phaseId?: string) => {
      const dayLabels: ProgramDayLabel[] = ['Day1', 'Day2', 'Day3', 'Day4', 'Day5', 'Day6', 'Day7'];
      const showWeekName = programType === 'advanced';

      return (
        <YStack
          key={week.id}
          padding="$3"
          backgroundColor={colors.midGray}
          borderRadius="$4"
          space="$3"
          marginBottom="$3"
        >
          {showWeekName && (
            <XStack space="$2" alignItems="center">
              <Input
                flex={1}
                value={week.name}
                onChangeText={(value) =>
                  phaseId
                    ? handleUpdateWeekNameInPhase(phaseId, week.id, value)
                    : handleUpdateWeekName(week.id, value)
                }
                placeholder={`${t('common.week')} ${weekIndex + 1}`}
                borderColor="$inputFieldBorder"
                placeholderTextColor="$inputFieldPlaceholderText"
                backgroundColor="$background"
                color="$textPrimary"
              />
              <Button
                size="$2"
                variant="outlined"
                color={colors.white}
                onPress={() =>
                  phaseId ? handleRemoveWeekFromPhase(phaseId, week.id) : handleRemoveWeek(week.id)
                }
              >
                <Entypo name="circle-with-cross" size={24} color={colors.niceOrange} />
              </Button>
            </XStack>
          )}

          <YStack space="$2">
            <Text color="$textPrimary" fontSize="$4" fontWeight="600">
              {t('program.selectActiveDays')}
            </Text>
            <DaySelector
              value={week.selectedDays}
              onSelectionChange={(selectedDays) =>
                handleDaySelectionChange(week.id, selectedDays, phaseId)
              }
            />
          </YStack>

          {week.days.map((day, dayIndex) => {
            if (day === 'rest') return null;

            const dayId = dayLabels[dayIndex];
            return (
              <YStack key={dayIndex} space="$2" marginTop="$2">
                <YStack space="$2">
                  <Text color="$textPrimary" fontSize="$5" fontWeight="600">
                    {t('common.day')} {dayIndex + 1} *
                  </Text>

                  <Input
                    value={day.name}
                    onChangeText={(value) => handleUpdateDayName(week.id, dayId, value, phaseId)}
                    placeholder={t('program.dayName')}
                    placeholderTextColor="$inputFieldPlaceholderText"
                    borderColor="$inputFieldBorder"
                    backgroundColor="$background"
                    color="$textPrimary"
                  />
                </YStack>
                {day.exercises.map((exercise, exerciseIndex) =>
                  renderExerciseCard(exercise, week.id, dayId, exerciseIndex, phaseId),
                )}
                <Button
                  size="$3"
                  backgroundColor="$secondaryButton"
                  color="$secondaryButtonText"
                  fontWeight="600"
                  borderRadius="$4"
                  onPress={() => handleOpenExercisePicker(week.id, dayId, phaseId)}
                >
                  <Entypo name="circle-with-plus" size={22} color={colors.white} />
                  <Text color={colors.white}>
                    {t('program.addExerciseTo')} {t('common.day')} {dayIndex + 1}
                  </Text>
                </Button>
              </YStack>
            );
          })}
        </YStack>
      );
    },
    [
      renderExerciseCard,
      handleOpenExercisePicker,
      handleUpdateWeekName,
      handleUpdateWeekNameInPhase,
      handleRemoveWeek,
      handleRemoveWeekFromPhase,
      handleDaySelectionChange,
      handleUpdateDayName,
      programType,
      t,
    ],
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.darkerGray }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
    >
      <YStack space="$4">
        <YStack space="$2">
          <Text color="$textPrimary" fontSize="$6" fontWeight="600">
            {t('program.programType')}
          </Text>
          <YStack space="$2">
            <XStack space="$2">
              <Button
                flex={1}
                backgroundColor={programType === 'simple' ? '$primaryButton' : colors.midGray}
                color={colors.white}
                onPress={() => {
                  setProgramType('simple');
                }}
              >
                {t('program.simple')}
              </Button>
              <Button
                flex={1}
                backgroundColor={programType === 'alternating' ? '$primaryButton' : colors.midGray}
                color={colors.white}
                onPress={() => {
                  setProgramType('alternating');
                }}
              >
                {t('program.alternating')}
              </Button>
            </XStack>
            <XStack space="$2" justifyContent="center">
              <Button
                flex={0.5}
                backgroundColor={programType === 'advanced' ? '$primaryButton' : colors.midGray}
                color={colors.white}
                onPress={() => {
                  setProgramType('advanced');
                }}
              >
                {t('program.advanced')}
              </Button>
            </XStack>
          </YStack>
        </YStack>

        <YStack space="$2">
          <Text color="$textPrimary" fontSize="$6" fontWeight="600">
            {t('program.programName')} *
          </Text>
          <Input
            value={name}
            onChangeText={setName}
            placeholder={t('program.enterProgramName')}
            placeholderTextColor="$inputFieldPlaceholderText"
            borderColor="$inputFieldBorder"
            backgroundColor="$inputFieldBackground"
            color="$textPrimary"
          />
        </YStack>

        <YStack space="$2">
          <Text color="$textPrimary" fontSize="$6" fontWeight="600">
            {t('program.description')} *
          </Text>
          <TextArea
            value={description}
            onChangeText={setDescription}
            placeholder={t('program.enterProgramDescription')}
            placeholderTextColor="$inputFieldPlaceholderText"
            borderColor="$inputFieldBorder"
            backgroundColor="$inputFieldBackground"
            color="$textPrimary"
            minHeight={100}
          />
        </YStack>

        {programType === 'simple' ? (
          <YStack space="$3">
            <Text color="$textPrimary" fontSize="$6" fontWeight="600">
              {t('common.week')}
            </Text>

            {weeks.map((week, index) => renderWeek(week, index))}
          </YStack>
        ) : programType === 'alternating' ? (
          <YStack space="$3">
            <Text color="$textPrimary" fontSize="$6" fontWeight="600">
              {t('program.alternatingWeeks')}
            </Text>
            <Text color="$textSecondary" fontSize="$4">
              {t('program.defineTwoWeeks')}
            </Text>

            {alternatingWeeks.map((week, index) => renderWeek(week, index))}
          </YStack>
        ) : (
          <YStack space="$3">
            <XStack alignItems="center" justifyContent="space-between">
              <Text color="$textPrimary" fontSize="$6" fontWeight="600">
                {t('program.phases')}
              </Text>
              <Button
                size="$3"
                backgroundColor="$secondaryButton"
                color="$secondaryButtonText"
                onPress={handleAddPhase}
              >
                <Entypo name="circle-with-plus" size={20} color={colors.white} />{' '}
                {t('program.addPhase')}
              </Button>
            </XStack>

            {phases.map((phase, phaseIndex) => (
              <YStack
                key={phase.id}
                padding="$3"
                backgroundColor={colors.midGray}
                borderRadius="$4"
                space="$3"
                marginBottom="$3"
              >
                <YStack space="$2">
                  <Text color="$textPrimary" fontSize="$5" fontWeight="600">
                    {t('program.phaseName', { index: phaseIndex + 1 })} *
                  </Text>
                  <XStack space="$2" alignItems="center">
                    <Input
                      flex={1}
                      value={phase.name}
                      onChangeText={(value) => handleUpdatePhaseName(phase.id, value)}
                      placeholder={`${t('program.phases')} ${phaseIndex + 1}`}
                      borderColor="$inputFieldBorder"
                      backgroundColor="$background"
                      color="$textPrimary"
                    />
                    <Button
                      size="$2"
                      variant="outlined"
                      color={colors.white}
                      onPress={() => handleRemovePhase(phase.id)}
                    >
                      <Entypo name="circle-with-cross" size={24} color={colors.niceOrange} />
                    </Button>
                  </XStack>
                </YStack>

                <YStack space="$2">
                  <Text color="$textPrimary" fontSize="$5" fontWeight="600">
                    {t('program.phaseDescription')}
                  </Text>
                  <TextArea
                    value={phase.description}
                    onChangeText={(value) => handleUpdatePhaseDescription(phase.id, value)}
                    placeholder={t('program.phaseDescription')}
                    borderColor="$inputFieldBorder"
                    backgroundColor="$background"
                    color="$textPrimary"
                    minHeight={80}
                  />
                </YStack>

                <XStack alignItems="center" justifyContent="space-between">
                  <Text color="$textPrimary" fontSize="$5" fontWeight="600">
                    {t('program.weeks')}
                  </Text>
                  <Button
                    size="$3"
                    backgroundColor="$secondaryButton"
                    color="$secondaryButtonText"
                    onPress={() => handleAddWeekToPhase(phase.id)}
                  >
                    <Entypo name="circle-with-plus" size={20} color={colors.white} />{' '}
                    {t('program.addWeek')}
                  </Button>
                </XStack>

                {phase.weeks.map((week, weekIndex) => renderWeek(week, weekIndex, phase.id))}
              </YStack>
            ))}
          </YStack>
        )}

        <Button
          size="$5"
          backgroundColor="$primaryButton"
          color={colors.white}
          fontWeight="600"
          borderRadius="$4"
          onPress={handleSave}
          disabled={isSaving}
          opacity={isSaving ? 0.6 : 1}
        >
          {isSaving ? t('common.saving') : saveButtonText || t('program.create')}
        </Button>
      </YStack>
    </ScrollView>
  );
}
