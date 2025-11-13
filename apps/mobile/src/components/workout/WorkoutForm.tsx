import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Modal, ScrollView } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Button, Input, Text, TextArea, XStack, YStack } from 'tamagui';
import Entypo from '@expo/vector-icons/Entypo';

import dayjs from 'dayjs';

import { WorkoutExercise, WorkoutInput } from '@/services/firestore';
import { colors } from '@/theme/colors';
import AntDesign from '@expo/vector-icons/AntDesign';
import { ExerciseSelection, WorkoutStackParamList } from '@/app/(tabs)/workout/types';
import { Calendar } from '@/components/Calendar';
import { Calendar as CalendarIcon } from '@tamagui/lucide-icons';

type WorkoutFormProps = {
  initialValues?: {
    date?: Date | string;
    notes?: string;
    exercises?: WorkoutExercise[];
  };
  onSubmit: (payload: WorkoutInput) => Promise<void> | void;
  isSubmitting?: boolean;
  submitLabel: string;
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

const createSetForm = (set?: { weight: number; reps: number; rir: number }): SetForm => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  weight: set ? String(set.weight) : '',
  reps: set ? String(set.reps) : '',
  rir: set ? String(set.rir) : '',
});

const createExerciseForm = (exercise: ExerciseSelection): ExerciseForm => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  exerciseId: exercise.id,
  exerciseOwnerId: exercise.source === 'library' ? 'global' : null,
  name: exercise.name,
  sets: [createSetForm()],
});

const mapExercisesToForm = (exercises: WorkoutExercise[]): ExerciseForm[] =>
  exercises.map((exercise) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    exerciseId: exercise.exerciseId,
    exerciseOwnerId: exercise.exerciseOwnerId ?? null,
    name: exercise.name,
    sets: exercise.sets.map((set) => createSetForm(set)),
  }));

type ExerciseCardProps = {
  exercise: ExerciseForm;
  index: number;
  onRemoveExercise: (exerciseId: string) => void;
  onAddSet: (exerciseId: string) => void;
  onRemoveSet: (exerciseId: string, setId: string) => void;
  onUpdateSetField: (
    exerciseId: string,
    setId: string,
    field: keyof Omit<SetForm, 'id'>,
    value: string,
  ) => void;
};

const ExerciseCard = ({
  exercise,
  index,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSetField,
}: ExerciseCardProps) => {
  return (
    <YStack
      padding="$2"
      backgroundColor={colors.midGray}
      borderRadius="$4"
      space="$3"
      marginBottom="$2"
    >
      <XStack paddingHorizontal="$2" alignItems="center" justifyContent="space-between">
        <Text color={colors.white} fontSize="$5" fontWeight="600">
          {index + 1}. {exercise.name}
        </Text>
        <Button
          size="$2"
          variant="outlined"
          color={colors.white}
          onPress={() => onRemoveExercise(exercise.id)}
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
              height={40}
              flex={1.5}
              value={set.weight}
              onChangeText={(value) => onUpdateSetField(exercise.id, set.id, 'weight', value)}
              placeholder="Weight"
              keyboardType="numeric"
              borderColor="$inputFieldBorder"
              backgroundColor="$background"
              color="$textPrimary"
            />
            <Text color={colors.white}>Kg</Text>

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
            />
            <Text color={colors.white}>RIR</Text>
            <Button
              size="$2"
              variant="outlined"
              color={colors.white}
              onPress={() => onRemoveSet(exercise.id, set.id)}
            >
              <AntDesign name="delete" size={24} color={colors.white} />
            </Button>
          </XStack>
        </YStack>
      ))}

      <Button
        size="$3"
        backgroundColor={colors.niceOrange}
        color={colors.white}
        fontWeight="600"
        borderRadius="$4"
        onPress={() => onAddSet(exercise.id)}
      >
        <Entypo name="circle-with-plus" size={22} color={colors.white} /> Add Set
      </Button>
    </YStack>
  );
};

export function WorkoutForm({
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitLabel,
}: WorkoutFormProps) {
  const navigation = useNavigation<NavigationProp<WorkoutStackParamList>>();

  const [date, setDate] = useState(() => {
    if (!initialValues?.date) {
      return new Date().toUTCString();
    }

    if (initialValues.date instanceof Date) {
      return initialValues.date.toUTCString();
    }

    return initialValues.date;
  });
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
    initialValues?.exercises ? mapExercisesToForm(initialValues.exercises) : [],
  );

  const handleSelectExercise = useCallback((exercise: ExerciseSelection) => {
    setExercises((prev) => [...prev, createExerciseForm(exercise)]);
  }, []);

  const handleOpenExercisePicker = useCallback(() => {
    navigation.navigate('exercises', { onSelect: handleSelectExercise });
  }, [handleSelectExercise, navigation]);

  const handleRemoveExercise = useCallback((exerciseId: string) => {
    setExercises((prev) => prev.filter((exercise) => exercise.id !== exerciseId));
  }, []);

  const handleAddSet = useCallback((exerciseId: string) => {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, sets: [...exercise.sets, createSetForm()] }
          : exercise,
      ),
    );
  }, []);

  const handleRemoveSet = useCallback((exerciseId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        if (exercise.sets.length === 1) {
          Alert.alert('Cannot remove set', 'Each exercise must have at least one set.');
          return exercise;
        }

        return {
          ...exercise,
          sets: exercise.sets.filter((set) => set.id !== setId),
        };
      }),
    );
  }, []);

  const handleUpdateSetField = useCallback(
    (exerciseId: string, setId: string, field: keyof Omit<SetForm, 'id'>, value: string) => {
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
    [],
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
          const weight = Number(set.weight);
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
  }, [date, exercises, notes]);

  const handleSubmit = useCallback(async () => {
    let workoutPayload: WorkoutInput;

    try {
      workoutPayload = buildWorkoutPayload();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Workout is not valid.';
      Alert.alert('Invalid workout', message);
      return;
    }

    try {
      await onSubmit(workoutPayload);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save workout.';
      Alert.alert('Failed to save workout', message);
    }
  }, [buildWorkoutPayload, onSubmit]);

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
                onRemoveSet={handleRemoveSet}
                onUpdateSetField={handleUpdateSetField}
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
            />
          </YStack>
          <Button
            backgroundColor={colors.niceOrange}
            color={colors.white}
            fontWeight="600"
            borderRadius="$4"
            onPress={handleSubmit}
            disabled={isSubmitting}
            opacity={isSubmitting ? 0.6 : 1}
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
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
    </>
  );
}
