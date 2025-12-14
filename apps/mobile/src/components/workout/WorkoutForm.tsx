import React, { useState } from 'react';
import { Modal, ScrollView } from 'react-native';
import { Button, Text, TextArea, XStack, YStack } from 'tamagui';
import Entypo from '@expo/vector-icons/Entypo';

import type { WorkoutExercise, WorkoutInput } from '@/services';
import { colors } from '@/theme/colors';
import { Calendar } from '@/components/Calendar';
import { Calendar as CalendarIcon } from '@tamagui/lucide-icons';
import { useAlertModal } from '@/hooks/useAlertModal';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useTranslation } from '@/hooks/useTranslation';
import { ExerciseCard } from './ExerciseCard';
import { useWorkoutFormState } from '@/hooks/useWorkoutFormState';
import { useWorkoutExercises } from '@/hooks/useWorkoutExercises';
import { useWorkoutValidation } from '@/hooks/useWorkoutValidation';
import { useWorkoutDate } from '@/hooks/useWorkoutDate';
import { useExercisePickerNavigation } from '@/hooks/useExercisePickerNavigation';
import { useWorkoutSubmission } from '@/hooks/useWorkoutSubmission';

type WorkoutFormProps = {
  initialValues?: {
    date?: Date | string;
    notes?: string;
    exercises?: WorkoutExercise[];
    validated?: boolean;
  };
  onSubmit: (payload: WorkoutInput) => Promise<void> | void;
  onValidateWorkout?: () => Promise<void> | void;
  onUnvalidateWorkout?: () => Promise<void> | void;
  onDeleteWorkout?: () => void;
  isSubmitting?: boolean;
  submitLabel: string;
  onFormChange?: (payload: WorkoutInput | null) => void;
  disableValidateButton?: boolean;
  disableSubmitButton?: boolean;
  workoutKey?: string; // Stable key to identify when workout changes
  exerciseNavigationPath?: string; // Path to navigate to exercise picker (schedule vs workout)
  currentWorkoutId?: string; // ID of the current workout (for edit mode, to exclude from conflict check)
};

export function WorkoutForm({
  initialValues,
  onSubmit,
  onValidateWorkout,
  onUnvalidateWorkout,
  onDeleteWorkout,
  isSubmitting = false,
  submitLabel,
  onFormChange,
  disableValidateButton = false,
  disableSubmitButton = false,
  workoutKey,
  exerciseNavigationPath,
  currentWorkoutId,
}: WorkoutFormProps) {
  const { preferences } = useUserPreferences();
  const weightUnit = preferences?.weightUnit ?? 'kg';
  const { t } = useTranslation();
  const { showWarning, showError, AlertModalComponent } = useAlertModal();

  const validated = initialValues?.validated ?? false;
  const [isUnvalidateModalVisible, setIsUnvalidateModalVisible] = useState(false);

  // Form state management
  const { date, setDate, notes, setNotes, exercises, setExercises } = useWorkoutFormState({
    initialValues,
    workoutKey,
    weightUnit,
  });

  // Exercise operations
  const {
    handleSelectExercise,
    handleRemoveExercise,
    handleAddSet,
    handleDuplicatePreviousSet,
    handleRemoveSet,
    handleUpdateSetField,
  } = useWorkoutExercises({
    exercises,
    setExercises,
    weightUnit,
    validated,
    onShowWarning: showWarning,
  });

  // Form validation
  const { buildWorkoutPayload, isFormValid } = useWorkoutValidation({
    date,
    notes,
    exercises,
    weightUnit,
    t,
  });

  // Date management
  const {
    selectedDateKey,
    formattedDisplayDate,
    markedDates,
    shouldShowValidateButton,
    isCalendarVisible,
    setIsCalendarVisible,
  } = useWorkoutDate({
    date,
    validated,
    onValidateWorkout,
  });

  // Exercise picker navigation
  const { handleOpenExercisePicker } = useExercisePickerNavigation({
    onSelectExercise: handleSelectExercise,
    validated,
    exerciseNavigationPath,
  });

  // Form submission
  const { handleSubmit } = useWorkoutSubmission({
    buildWorkoutPayload,
    onSubmit,
    validated,
    date,
    notes,
    exercises,
    onFormChange,
    currentWorkoutId,
    onShowWarning: showWarning,
    onShowError: showError,
  });

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.darkerGray }}
        contentContainerStyle={{
          padding: 16,
          gap: 16,
          paddingBottom: 64,
        }}
      >
        <YStack space="$4">
          <Button
            backgroundColor={colors.niceOrange}
            color={colors.white}
            fontWeight="600"
            borderRadius="$4"
            onPress={handleOpenExercisePicker}
            disabled={validated}
            opacity={validated ? 0.6 : 1}
          >
            <Entypo name="circle-with-plus" size={22} color={colors.white} />
            {t('workout.addExercise')}
          </Button>

          <XStack
            alignItems="center"
            justifyContent="space-between"
            backgroundColor="rgba(249, 115, 22, 0.15)"
            borderRadius="$4"
            padding="$3"
          >
            <YStack space="$1">
              <Text color="$textSecondary" fontSize="$3">
                {t('common.selectedDate')}
              </Text>
              <Text color="$textPrimary" fontSize="$5" fontWeight="600">
                {formattedDisplayDate}
              </Text>
            </YStack>
            <Button
              size="$3"
              backgroundColor="$primaryButton"
              color="$primaryButtonText"
              borderRadius="$4"
              onPress={() => setIsCalendarVisible(true)}
              pressStyle={{ opacity: 0.85 }}
              disabled={validated}
              opacity={validated ? 0.6 : 1}
            >
              <CalendarIcon size={22} color={colors.white} />
            </Button>
          </XStack>
          <Text color={colors.white} fontWeight="600" fontSize="$5">
            {t('workout.exercises')}
          </Text>
          {exercises.length === 0 ? (
            <YStack padding="$4" backgroundColor={colors.midGray} borderRadius="$4">
              <Text color={colors.white}>{t('workout.noExercisesYet')}</Text>
            </YStack>
          ) : (
            exercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={index}
                onRemoveExercise={handleRemoveExercise}
                onAddSet={handleAddSet}
                onDuplicatePreviousSet={handleDuplicatePreviousSet}
                onRemoveSet={(exerciseId, setId) =>
                  handleRemoveSet(exerciseId, setId, t('workout.eachExerciseMustHaveSet'))
                }
                onUpdateSetField={handleUpdateSetField}
                disabled={validated}
                weightUnit={weightUnit}
              />
            ))
          )}
          <YStack space="$3">
            <Text color={colors.white} fontWeight="600" fontSize="$5">
              {t('workout.notes')}
            </Text>
            <TextArea
              value={notes}
              onChangeText={setNotes}
              borderColor="$inputFieldBorder"
              backgroundColor="$inputFieldBackground"
              color="$inputFieldText"
              placeholder={t('workout.optionalNotes')}
              placeholderTextColor="$inputFieldPlaceholderText"
              minHeight={120}
              autoCapitalize="sentences"
              editable={!validated}
              opacity={validated ? 0.6 : 1}
            />
          </YStack>
          <Button
            backgroundColor={colors.niceOrange}
            color={colors.white}
            fontWeight="600"
            borderRadius="$4"
            onPress={handleSubmit}
            disabled={isSubmitting || validated || disableSubmitButton || !isFormValid}
            opacity={isSubmitting || validated || disableSubmitButton || !isFormValid ? 0.6 : 1}
          >
            {isSubmitting ? t('common.saving') : submitLabel}
          </Button>
          {shouldShowValidateButton && onValidateWorkout && (
            <Button
              alignSelf="center"
              minWidth="50%"
              backgroundColor="#1ABC9C"
              color={colors.white}
              fontWeight="600"
              borderRadius="$4"
              onPress={onValidateWorkout}
              disabled={isSubmitting || disableValidateButton}
              opacity={isSubmitting || disableValidateButton ? 0.6 : 1}
            >
              {t('workout.validateWorkout')}
            </Button>
          )}

          {validated && onUnvalidateWorkout && (
            <Button
              alignSelf="center"
              minWidth="50%"
              backgroundColor="#ef4444"
              color={colors.white}
              fontWeight="600"
              borderRadius="$4"
              onPress={() => setIsUnvalidateModalVisible(true)}
              disabled={isSubmitting}
              opacity={isSubmitting ? 0.6 : 1}
            >
              {t('workout.markAsIncomplete')}
            </Button>
          )}

          {onDeleteWorkout && (
            <Button
              alignSelf="center"
              minWidth="50%"
              backgroundColor="#ef4444"
              color={colors.white}
              fontWeight="600"
              borderRadius="$4"
              onPress={onDeleteWorkout}
              disabled={isSubmitting}
              opacity={isSubmitting ? 0.6 : 1}
            >
              {t('workout.deleteWorkout')}
            </Button>
          )}
        </YStack>
      </ScrollView>

      <Modal
        visible={isCalendarVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCalendarVisible(false)}
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
            backgroundColor={colors.midGray}
            borderRadius="$4"
            padding="$4"
            space="$4"
          >
            <XStack alignItems="center" justifyContent="space-between">
              <Text color={colors.white} fontSize="$5" fontWeight="600">
                {t('workout.selectWorkoutDate')}
              </Text>
            </XStack>
            <Calendar
              current={selectedDateKey}
              onDayPress={(day) => {
                const nextDate = new Date(day.dateString);
                setDate(nextDate.toUTCString());
                setIsCalendarVisible(false);
              }}
              markedDates={markedDates}
              theme={{
                backgroundColor: colors.darkerGray,
                calendarBackground: colors.midGray,
              }}
              hideExtraDays
            />
            <Button
              size="$2"
              backgroundColor={colors.niceOrange}
              height={40}
              width="50%"
              fontWeight="600"
              fontSize="$3"
              borderRadius="$4"
              color={colors.white}
              onPress={() => setIsCalendarVisible(false)}
            >
              {t('common.close')}
            </Button>
          </YStack>
        </YStack>
      </Modal>

      <Modal
        visible={isUnvalidateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsUnvalidateModalVisible(false)}
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
            backgroundColor={colors.midGray}
            borderRadius="$4"
            padding="$4"
            space="$4"
          >
            <Text color={colors.white} fontSize="$6" fontWeight="600">
              {t('workout.markWorkoutAsIncomplete')}
            </Text>
            <Text color="$textSecondary" fontSize="$4">
              {t('workout.markWorkoutAsIncompleteMessage')}
            </Text>
            <XStack space="$3" justifyContent="flex-end">
              <Button
                backgroundColor={colors.midGray}
                color={colors.white}
                borderWidth={1}
                borderColor={colors.white}
                onPress={() => setIsUnvalidateModalVisible(false)}
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </Button>
              <Button
                backgroundColor="#ef4444"
                color={colors.white}
                onPress={async () => {
                  setIsUnvalidateModalVisible(false);
                  if (onUnvalidateWorkout) {
                    await onUnvalidateWorkout();
                  }
                }}
                disabled={isSubmitting}
                opacity={isSubmitting ? 0.6 : 1}
              >
                {isSubmitting ? t('common.processing') : t('common.yes')}
              </Button>
            </XStack>
          </YStack>
        </YStack>
      </Modal>

      <AlertModalComponent duration={2000} />
    </>
  );
}
