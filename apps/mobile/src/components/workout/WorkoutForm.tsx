import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Modal, ScrollView } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Button, Text, TextArea, XStack, YStack } from 'tamagui';
import Entypo from '@expo/vector-icons/Entypo';

import dayjs from 'dayjs';

import type { WorkoutExercise, WorkoutInput } from '@/services';
import { colors } from '@/theme/colors';
import { ExerciseSelection, WorkoutStackParamList } from '@/types/workout';
import { Calendar } from '@/components/Calendar';
import { Calendar as CalendarIcon } from '@tamagui/lucide-icons';
import { useAlertModal } from '@/hooks/useAlertModal';
import { getServiceErrorMessage } from '@/utils/serviceErrors';
import { setExercisePickerCallback } from '@/contexts/exercisePickerContext';
import { useUserWorkouts } from '@/hooks/useUserWorkouts';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { weightForDisplay, parseWeightInput, kgToLb, lbToKg } from '@/utils/units';
import { useTranslation } from '@/hooks/useTranslation';
import { ExerciseCard, type ExerciseForm, type SetForm } from './ExerciseCard';

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

const createSetForm = (
  set?: { weight: number; reps: number; rir: number },
  weightUnit: 'kg' | 'lb' = 'kg',
): SetForm => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  // Convert weight from kg (storage) to display unit
  weight: set ? String(weightForDisplay(set.weight, weightUnit)) : '0',
  reps: set ? String(set.reps) : '0',
  rir: set ? String(set.rir) : '0',
});

const createExerciseForm = (
  exercise: ExerciseSelection,
  weightUnit: 'kg' | 'lb' = 'kg',
): ExerciseForm => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  exerciseId: exercise.id,
  name: exercise.name,
  sets: [createSetForm(undefined, weightUnit)],
});

const mapExercisesToForm = (
  exercises: WorkoutExercise[],
  weightUnit: 'kg' | 'lb' = 'kg',
): ExerciseForm[] =>
  exercises.map((exercise) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    exerciseId: exercise.exerciseId,
    name: exercise.name,
    sets: exercise.sets.map((set) => createSetForm(set, weightUnit)),
  }));

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
  const navigation = useNavigation<NavigationProp<WorkoutStackParamList>>();
  const router = useRouter();
  const { workouts } = useUserWorkouts();
  const { preferences } = useUserPreferences();
  const weightUnit = preferences?.weightUnit ?? 'kg';
  const { t } = useTranslation();

  const [date, setDate] = useState(() => {
    if (!initialValues?.date) {
      return new Date().toUTCString();
    }

    if (initialValues.date instanceof Date) {
      return initialValues.date.toUTCString();
    }

    return initialValues.date;
  });

  const validated = initialValues?.validated ?? false;
  const [isUnvalidateModalVisible, setIsUnvalidateModalVisible] = useState(false);
  const { showWarning, showError, AlertModalComponent } = useAlertModal();

  // Check if validate button should be shown
  const shouldShowValidateButton = useMemo(() => {
    if (!onValidateWorkout) {
      return false; // Not in edit mode
    }

    if (validated) {
      return false; // Already validated
    }

    const workoutDate = new Date(date);
    if (Number.isNaN(workoutDate.getTime())) {
      return false;
    }

    const isToday = dayjs(workoutDate).isSame(dayjs(), 'day');
    const isBeforeToday = dayjs(workoutDate).isBefore(dayjs(), 'day');

    // Show if date is today or prior
    return isToday || isBeforeToday;
  }, [onValidateWorkout, validated, date]);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const selectedDateKey = useMemo(() => {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return dayjs(parsedDate).format('YYYY-MM-DD');
  }, [date]);

  const formattedDisplayDate = useMemo(() => {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return t('common.noDateSelected');
    }

    return dayjs(parsedDate).format('MMMM D, YYYY');
  }, [date, t]);

  const markedDates = useMemo(() => {
    if (!selectedDateKey) {
      return undefined;
    }

    return {
      [selectedDateKey]: {
        selected: true,
        selectedColor: colors.niceOrange,
        selectedTextColor: colors.white,
      },
    };
  }, [selectedDateKey]);
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [exercises, setExercises] = useState<ExerciseForm[]>(() =>
    initialValues?.exercises ? mapExercisesToForm(initialValues.exercises, weightUnit) : [],
  );

  // Track the workout key to detect when we're loading a different workout
  const initializedWorkoutKeyRef = useRef<string | null | undefined>(workoutKey);
  // Track previous weight unit to detect changes
  const previousWeightUnitRef = useRef<'kg' | 'lb'>(weightUnit);

  // Only initialize/reset when loading a different workout (different workoutKey)
  useEffect(() => {
    // If this is a new workout (different key), reset the form
    if (workoutKey !== undefined && workoutKey !== initializedWorkoutKeyRef.current) {
      if (initialValues?.exercises) {
        setExercises(mapExercisesToForm(initialValues.exercises, weightUnit));
      }
      if (initialValues?.notes !== undefined) {
        setNotes(initialValues.notes);
      }
      initializedWorkoutKeyRef.current = workoutKey;
    } else if (workoutKey === undefined && initializedWorkoutKeyRef.current !== undefined) {
      // Clear form if workoutKey was cleared (create mode)
      if (initialValues?.exercises) {
        setExercises(mapExercisesToForm(initialValues.exercises, weightUnit));
      } else {
        setExercises([]);
      }
      setNotes(initialValues?.notes ?? '');
      initializedWorkoutKeyRef.current = undefined;
    }
  }, [workoutKey, initialValues?.exercises, initialValues?.notes, weightUnit]);

  // Convert weights when weight unit changes
  useEffect(() => {
    const previousUnit = previousWeightUnitRef.current;

    // Only convert if unit actually changed and we have exercises
    if (previousUnit !== weightUnit && exercises.length > 0) {
      setExercises((prevExercises) =>
        prevExercises.map((exercise) => ({
          ...exercise,
          sets: exercise.sets.map((set) => {
            const weightValue = set.weight.trim();

            // Skip empty weights
            if (!weightValue) {
              return set;
            }

            const numValue = parseFloat(weightValue);
            if (isNaN(numValue)) {
              return set;
            }

            // Convert from previous unit to kg, then to new unit
            let weightInKg: number;
            if (previousUnit === 'lb') {
              weightInKg = lbToKg(numValue);
            } else {
              weightInKg = numValue;
            }

            // Convert from kg to new unit
            let newWeight: number;
            if (weightUnit === 'lb') {
              newWeight = kgToLb(weightInKg);
            } else {
              newWeight = weightInKg;
            }

            return {
              ...set,
              weight: String(newWeight),
            };
          }),
        })),
      );
    }

    // Update the ref to track current unit
    previousWeightUnitRef.current = weightUnit;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weightUnit]);

  // Track previous form values to avoid unnecessary onFormChange calls
  const previousFormValuesRef = useRef<string>('');

  const handleSelectExercise = useCallback(
    (exercise: ExerciseSelection) => {
      if (validated) return;
      setExercises((prev) => [...prev, createExerciseForm(exercise, weightUnit)]);
    },
    [validated, weightUnit],
  );

  const handleOpenExercisePicker = useCallback(() => {
    if (validated) return;

    // Use context-aware navigation path if provided (for schedule), otherwise use React Navigation (for workout)
    if (exerciseNavigationPath) {
      // For expo-router navigation, use the exercise picker context to pass the callback
      setExercisePickerCallback(handleSelectExercise);
      router.push(exerciseNavigationPath);
    } else {
      // For React Navigation (workout stack), pass callback directly via params
      navigation.navigate('exercises', { onSelect: handleSelectExercise });
    }
  }, [handleSelectExercise, navigation, router, validated, exerciseNavigationPath]);

  const handleRemoveExercise = useCallback(
    (exerciseId: string) => {
      if (validated) return;
      setExercises((prev) => prev.filter((exercise) => exercise.id !== exerciseId));
    },
    [validated],
  );

  const handleAddSet = useCallback(
    (exerciseId: string) => {
      if (validated) return;
      setExercises((prev) =>
        prev.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, sets: [...exercise.sets, createSetForm(undefined, weightUnit)] }
            : exercise,
        ),
      );
    },
    [validated, weightUnit],
  );

  const handleDuplicatePreviousSet = useCallback(
    (exerciseId: string) => {
      if (validated) return;
      setExercises((prev) =>
        prev.map((exercise) => {
          if (exercise.id !== exerciseId || exercise.sets.length === 0) {
            return exercise;
          }

          const lastSet = exercise.sets[exercise.sets.length - 1];
          // Parse the weight from display unit back to kg, then create new set
          const weightInKg = parseWeightInput(lastSet.weight, weightUnit);
          const duplicatedSet = createSetForm(
            {
              weight: weightInKg,
              reps: lastSet.reps ? Number(lastSet.reps) : 0,
              rir: lastSet.rir ? Number(lastSet.rir) : 0,
            },
            weightUnit,
          );

          return {
            ...exercise,
            sets: [...exercise.sets, duplicatedSet],
          };
        }),
      );
    },
    [validated, weightUnit],
  );

  const handleRemoveSet = useCallback(
    (exerciseId: string, setId: string) => {
      if (validated) return;
      setExercises((prev) =>
        prev.map((exercise) => {
          if (exercise.id !== exerciseId) {
            return exercise;
          }

          if (exercise.sets.length === 1) {
            showWarning(t('workout.eachExerciseMustHaveSet'));
            return exercise;
          }

          return {
            ...exercise,
            sets: exercise.sets.filter((set) => set.id !== setId),
          };
        }),
      );
    },
    [validated],
  );

  const handleUpdateSetField = useCallback(
    (exerciseId: string, setId: string, field: keyof Omit<SetForm, 'id'>, value: string) => {
      if (validated) return;
      setExercises((prev) =>
        prev.map((exercise) => {
          if (exercise.id !== exerciseId) {
            return exercise;
          }

          return {
            ...exercise,
            sets: exercise.sets.map((set) =>
              set.id === setId
                ? {
                    ...set,
                    [field]: value,
                  }
                : set,
            ),
          };
        }),
      );
    },
    [validated],
  );

  const buildWorkoutPayload = useCallback(() => {
    if (!date) {
      throw new Error(t('workout.workoutDateRequired'));
    }

    const workoutDate = new Date(date);
    if (Number.isNaN(workoutDate.getTime())) {
      throw new Error(t('workout.workoutDateInvalid'));
    }

    if (exercises.length === 0) {
      throw new Error(t('workout.addAtLeastOneExercise'));
    }

    const workoutExercises = exercises.map((exercise, index) => {
      if (exercise.sets.length === 0) {
        throw new Error(t('workout.exerciseMustHaveSet', { name: exercise.name }));
      }

      return {
        exerciseId: exercise.exerciseId,

        name: exercise.name,
        order: index + 1,
        sets: exercise.sets.map((set, setIndex) => {
          // Convert weight from display unit to kg (storage)
          const weight = parseWeightInput(set.weight, weightUnit);
          const reps = Number(set.reps);
          const rir = Number(set.rir);

          if (Number.isNaN(weight) || Number.isNaN(reps) || Number.isNaN(rir)) {
            throw new Error(
              t('workout.setRequiresNumericValues', {
                setIndex: setIndex + 1,
                exerciseName: exercise.name,
              }),
            );
          }

          // Validate reps is positive
          if (reps <= 0) {
            throw new Error(
              t('workout.repsMustBePositive', {
                setIndex: setIndex + 1,
                exerciseName: exercise.name,
              }),
            );
          }

          // Validate weight is positive
          if (weight <= 0) {
            throw new Error(
              t('workout.weightMustBePositive', {
                setIndex: setIndex + 1,
                exerciseName: exercise.name,
              }),
            );
          }

          // Validate RIR is between 0 and 10
          if (rir < 0 || rir > 10) {
            throw new Error(
              t('workout.rirMustBeBetween0And10', {
                setIndex: setIndex + 1,
                exerciseName: exercise.name,
              }),
            );
          }

          return {
            weight,
            reps,
            rir,
          };
        }),
      };
    });

    return {
      date: workoutDate,
      notes,
      exercises: workoutExercises,
    };
  }, [date, exercises, notes, weightUnit, t]);

  // Validate form and check if it's valid
  const isFormValid = useMemo(() => {
    try {
      if (!date) return false;
      const workoutDate = new Date(date);
      if (Number.isNaN(workoutDate.getTime())) return false;
      if (exercises.length === 0) return false;
      for (const exercise of exercises) {
        if (exercise.sets.length === 0) return false;
        for (const set of exercise.sets) {
          // Parse weight considering weight unit
          const weight = parseWeightInput(set.weight, weightUnit);
          const reps = Number(set.reps);
          const rir = Number(set.rir);

          // Check if values are valid numbers
          if (Number.isNaN(weight) || Number.isNaN(reps) || Number.isNaN(rir)) {
            return false;
          }

          // Validate reps is positive
          if (reps <= 0) {
            return false;
          }

          // Validate weight is positive
          if (weight <= 0) {
            return false;
          }

          // Validate RIR is between 0 and 10
          if (rir < 0 || rir > 10) {
            return false;
          }
        }
      }
      return true;
    } catch {
      return false;
    }
  }, [date, exercises, weightUnit]);

  // Notify parent of form changes
  useEffect(() => {
    if (!onFormChange) return;

    // Create a stable key from form values to detect actual changes
    const formKey = JSON.stringify({
      date,
      notes,
      exercises: exercises.map((ex) => ({
        exerciseId: ex.exerciseId,

        name: ex.name,
        sets: ex.sets.map((set) => ({
          weight: set.weight,
          reps: set.reps,
          rir: set.rir,
        })),
      })),
    });

    // Only notify if values actually changed
    if (formKey === previousFormValuesRef.current) {
      return;
    }

    previousFormValuesRef.current = formKey;

    try {
      const payload = buildWorkoutPayload();
      onFormChange(payload);
    } catch {
      // Form is invalid, notify parent with null
      onFormChange(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, notes, exercises, onFormChange]);

  const handleSubmit = useCallback(async () => {
    if (validated) {
      showWarning(t('workout.workoutValidatedCannotModify'));
      return;
    }

    let workoutPayload;

    try {
      workoutPayload = buildWorkoutPayload();
    } catch (error) {
      const message = getServiceErrorMessage(error, t);
      showError(message);
      return;
    }

    // Check if there's already a workout on this date
    if (workouts && workouts.length > 0) {
      const selectedDate = workoutPayload.date;
      const selectedDateKey = dayjs(selectedDate).format('YYYY-MM-DD');

      const conflictingWorkout = workouts.find((workout) => {
        // Exclude the current workout if we're editing
        if (currentWorkoutId && workout.id === currentWorkoutId) {
          return false;
        }
        const workoutDateKey = dayjs(workout.date).format('YYYY-MM-DD');
        return workoutDateKey === selectedDateKey;
      });

      if (conflictingWorkout) {
        showWarning(t('workout.workoutAlreadyExistsOnDate'));
        return;
      }
    }

    try {
      await onSubmit(workoutPayload);
    } catch (error) {
      const message = getServiceErrorMessage(error, t);
      showError(message);
    }
  }, [
    buildWorkoutPayload,
    onSubmit,
    validated,
    workouts,
    currentWorkoutId,
    showWarning,
    showError,
    t,
  ]);

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
                onRemoveSet={handleRemoveSet}
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
              width="50%"
              backgroundColor="#22c55e"
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
              <Button
                size="$2"
                variant="outlined"
                color={colors.white}
                onPress={() => setIsCalendarVisible(false)}
              >
                {t('common.close')}
              </Button>
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
