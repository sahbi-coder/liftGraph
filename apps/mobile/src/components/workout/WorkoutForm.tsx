import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Modal, ScrollView } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Button, Input, Text, TextArea, XStack, YStack } from 'tamagui';
import Entypo from '@expo/vector-icons/Entypo';

import dayjs from 'dayjs';

import type { WorkoutExercise, WorkoutInput } from '@/domain';
import { colors } from '@/theme/colors';
import AntDesign from '@expo/vector-icons/AntDesign';
import { ExerciseSelection, WorkoutStackParamList } from '@/types/workout';
import { Calendar } from '@/components/Calendar';
import { Calendar as CalendarIcon } from '@tamagui/lucide-icons';
import { AlertModal } from '@/components/AlertModal';
import { setExercisePickerCallback } from '@/contexts/exercisePickerContext';
import { useUserWorkouts } from '@/hooks/useUserWorkouts';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { weightForDisplay, parseWeightInput, kgToLb, lbToKg } from '@/utils/units';

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

type SetForm = {
  id: string;
  weight: string;
  reps: string;
  rir: string;
};

type ExerciseForm = {
  id: string;
  exerciseId: string;
  exerciseOwnerId: string | null;
  name: string;
  sets: SetForm[];
};

const createSetForm = (
  set?: { weight: number; reps: number; rir: number },
  weightUnit: 'kg' | 'lb' = 'kg',
): SetForm => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  // Convert weight from kg (storage) to display unit
  weight: set ? String(weightForDisplay(set.weight, weightUnit)) : '',
  reps: set ? String(set.reps) : '',
  rir: set ? String(set.rir) : '',
});

const createExerciseForm = (
  exercise: ExerciseSelection,
  weightUnit: 'kg' | 'lb' = 'kg',
): ExerciseForm => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  exerciseId: exercise.id,
  exerciseOwnerId: exercise.source === 'library' ? 'global' : null,
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
    exerciseOwnerId: exercise.exerciseOwnerId ?? null,
    name: exercise.name,
    sets: exercise.sets.map((set) => createSetForm(set, weightUnit)),
  }));

type ExerciseCardProps = {
  exercise: ExerciseForm;
  index: number;
  onRemoveExercise: (exerciseId: string) => void;
  onAddSet: (exerciseId: string) => void;
  onDuplicatePreviousSet: (exerciseId: string) => void;
  onRemoveSet: (exerciseId: string, setId: string) => void;
  onUpdateSetField: (
    exerciseId: string,
    setId: string,
    field: keyof Omit<SetForm, 'id'>,
    value: string,
  ) => void;
  disabled?: boolean;
  weightUnit: 'kg' | 'lb';
};

const ExerciseCard = ({
  exercise,
  index,
  onRemoveExercise,
  onAddSet,
  onDuplicatePreviousSet,
  onRemoveSet,
  onUpdateSetField,
  disabled = false,
  weightUnit,
}: ExerciseCardProps) => {
  return (
    <YStack
      padding="$2"
      backgroundColor={colors.midGray}
      borderRadius="$4"
      space="$3"
      marginBottom="$2"
    >
      <XStack
        paddingHorizontal="$2"
        alignItems="center"
        justifyContent="space-between"
        position="relative"
      >
        <Text color={colors.white} fontSize="$5" fontWeight="600">
          {index + 1}. {exercise.name}
        </Text>
        <Button
          position="absolute"
          right={-12}
          top={-8}
          size="$2"
          variant="outlined"
          color={colors.white}
          onPress={() => onRemoveExercise(exercise.id)}
          disabled={disabled}
          opacity={disabled ? 0.5 : 1}
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
          <XStack space="$2" alignItems="center" position="relative">
            <Input
              height={40}
              flex={2}
              value={set.weight}
              onChangeText={(value) => onUpdateSetField(exercise.id, set.id, 'weight', value)}
              placeholder="Weight"
              keyboardType="numeric"
              borderColor="$inputFieldBorder"
              backgroundColor="$background"
              color="$textPrimary"
              editable={!disabled}
              opacity={disabled ? 0.6 : 1}
            />
            <Text color={colors.white}>{weightUnit === 'lb' ? 'lbs' : 'kg'}</Text>

            <Input
              flex={1}
              height={40}
              value={set.reps}
              onChangeText={(value) => onUpdateSetField(exercise.id, set.id, 'reps', value)}
              placeholder="Reps"
              keyboardType="numeric"
              borderColor="$inputFieldBorder"
              backgroundColor="$background"
              color="$textPrimary"
              editable={!disabled}
              opacity={disabled ? 0.6 : 1}
            />
            <Text color={colors.white}>R</Text>

            <Input
              flex={1}
              height={40}
              value={set.rir}
              onChangeText={(value) => onUpdateSetField(exercise.id, set.id, 'rir', value)}
              placeholder="RIR"
              keyboardType="numeric"
              borderColor="$inputFieldBorder"
              backgroundColor="$background"
              color="$textPrimary"
              editable={!disabled}
              opacity={disabled ? 0.6 : 1}
            />
            <Text color={colors.white}>RIR</Text>
            <Button
              position="absolute"
              right={-18}
              top={-18}
              size="$2"
              variant="outlined"
              color={colors.white}
              onPress={() => onRemoveSet(exercise.id, set.id)}
              disabled={disabled}
              opacity={disabled ? 0.5 : 1}
            >
              <Entypo name="circle-with-cross" size={24} color={colors.white} />
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
          onPress={() => onAddSet(exercise.id)}
          disabled={disabled}
          opacity={disabled ? 0.6 : 1}
        >
          <Entypo name="circle-with-plus" size={22} color={colors.white} /> Add Set
        </Button>
        <Button
          size="$3"
          flex={1}
          backgroundColor={colors.niceOrange}
          color={colors.white}
          fontWeight="600"
          borderRadius="$4"
          onPress={() => onDuplicatePreviousSet(exercise.id)}
          disabled={disabled || exercise.sets.length === 0}
          opacity={disabled || exercise.sets.length === 0 ? 0.6 : 1}
        >
          <AntDesign name="copy1" size={22} color={colors.white} /> Duplicate previous
        </Button>
      </XStack>
    </YStack>
  );
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
  const navigation = useNavigation<NavigationProp<WorkoutStackParamList>>();
  const router = useRouter();
  const { workouts } = useUserWorkouts();
  const { preferences } = useUserPreferences();
  const weightUnit = preferences?.weightUnit ?? 'kg';

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
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'info',
  });

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
      return 'No date selected';
    }

    return dayjs(parsedDate).format('MMMM D, YYYY');
  }, [date]);

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
            setAlertModal({
              visible: true,
              message: 'Each exercise must have at least one set.',
              type: 'warning',
            });
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

  const buildWorkoutPayload = useCallback((): WorkoutInput => {
    if (!date) {
      throw new Error('Workout date is required.');
    }

    const workoutDate = new Date(date);
    if (Number.isNaN(workoutDate.getTime())) {
      throw new Error('Workout date is invalid. Use ISO 8601 format.');
    }

    if (exercises.length === 0) {
      throw new Error('Add at least one exercise to the workout.');
    }

    const workoutExercises = exercises.map((exercise, index) => {
      if (exercise.sets.length === 0) {
        throw new Error(`Exercise "${exercise.name}" must have at least one set.`);
      }

      return {
        exerciseId: exercise.exerciseId,
        exerciseOwnerId: exercise.exerciseOwnerId,
        name: exercise.name,
        order: index + 1,
        sets: exercise.sets.map((set, setIndex) => {
          // Convert weight from display unit to kg (storage)
          const weight = parseWeightInput(set.weight, weightUnit);
          const reps = Number(set.reps);
          const rir = Number(set.rir);

          if (Number.isNaN(weight) || Number.isNaN(reps) || Number.isNaN(rir)) {
            throw new Error(
              `Set ${setIndex + 1} in "${exercise.name}" requires numeric weight, reps, and RIR.`,
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
  }, [date, exercises, notes, weightUnit]);

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
          const weight = Number(set.weight);
          const reps = Number(set.reps);
          const rir = Number(set.rir);
          if (Number.isNaN(weight) || Number.isNaN(reps) || Number.isNaN(rir)) {
            return false;
          }
        }
      }
      return true;
    } catch {
      return false;
    }
  }, [date, exercises]);

  // Notify parent of form changes
  useEffect(() => {
    if (!onFormChange) return;

    // Create a stable key from form values to detect actual changes
    const formKey = JSON.stringify({
      date,
      notes,
      exercises: exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        exerciseOwnerId: ex.exerciseOwnerId,
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
      setAlertModal({
        visible: true,
        message: 'This workout has been validated and cannot be modified.',
        type: 'warning',
      });
      return;
    }

    let workoutPayload: WorkoutInput;

    try {
      workoutPayload = buildWorkoutPayload();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Workout is not valid.';
      setAlertModal({
        visible: true,
        message,
        type: 'error',
      });
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
        setAlertModal({
          visible: true,
          message: 'A workout already exists on this date. Please choose a different date.',
          type: 'warning',
        });
        return;
      }
    }

    try {
      await onSubmit(workoutPayload);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save workout.';
      setAlertModal({
        visible: true,
        message,
        type: 'error',
      });
    }
  }, [buildWorkoutPayload, onSubmit, validated, workouts, currentWorkoutId]);

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
            Add Exercise
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
                Selected Date
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
            Exercises
          </Text>
          {exercises.length === 0 ? (
            <YStack padding="$4" backgroundColor={colors.midGray} borderRadius="$4">
              <Text color={colors.white}>
                No exercises yet. Tap Add Exercise” to add one to this workout.
              </Text>
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
              Notes
            </Text>
            <TextArea
              value={notes}
              onChangeText={setNotes}
              borderColor="$inputFieldBorder"
              backgroundColor="$inputFieldBackground"
              color="$inputFieldText"
              placeholder="Optional notes about this workout"
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
            {isSubmitting ? 'Saving...' : submitLabel}
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
              Validate Workout
            </Button>
          )}

          {validated && onUnvalidateWorkout && (
            <Button
              alignSelf="center"
              width="50%"
              backgroundColor="#ef4444"
              color={colors.white}
              fontWeight="600"
              borderRadius="$4"
              onPress={() => setIsUnvalidateModalVisible(true)}
              disabled={isSubmitting}
              opacity={isSubmitting ? 0.6 : 1}
            >
              Mark as Incomplete
            </Button>
          )}

          {onDeleteWorkout && (
            <Button
              alignSelf="center"
              width="50%"
              backgroundColor="#ef4444"
              color={colors.white}
              fontWeight="600"
              borderRadius="$4"
              onPress={onDeleteWorkout}
              disabled={isSubmitting}
              opacity={isSubmitting ? 0.6 : 1}
            >
              Delete Workout
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
                Select Workout Date
              </Text>
              <Button
                size="$2"
                variant="outlined"
                color={colors.white}
                onPress={() => setIsCalendarVisible(false)}
              >
                Close
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
              Mark Workout as Incomplete?
            </Text>
            <Text color="$textSecondary" fontSize="$4">
              This will allow you to edit the workout again. Are you sure you want to mark this
              workout as incomplete?
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
                Cancel
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
                {isSubmitting ? 'Processing...' : 'Mark as Incomplete'}
              </Button>
            </XStack>
          </YStack>
        </YStack>
      </Modal>

      <AlertModal
        visible={alertModal.visible}
        message={alertModal.message}
        type={alertModal.type}
        duration={2000}
        onComplete={() => setAlertModal((prev) => ({ ...prev, visible: false }))}
      />
    </>
  );
}
