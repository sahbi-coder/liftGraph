import React from 'react';
import { Button, Input, Text, XStack, YStack } from 'tamagui';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';

import { colors } from '@/theme/colors';
import { useTranslation } from '@/hooks/common/useTranslation';
import { hasLoadUnit } from '@/utils/exerciseHelpers';

export type SetForm = {
  id: string;
  weight: string;
  reps: string;
  rir: string;
};

export type ExerciseForm = {
  id: string;
  exerciseId: string;
  name: string;
  allowedUnits: string[];
  sets: SetForm[];
};

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

export const ExerciseCard = ({
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
  const { t } = useTranslation();
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
          testID={`remove-exercise-button-${index}`}
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

      {exercise.sets.map((set, setIndex) => {
        const hasLoad = hasLoadUnit(exercise.allowedUnits, true); // Default to true for backwards compatibility

        return (
          <YStack
            key={set.id}
            space="$2"
            backgroundColor={colors.lightGray}
            padding="$2"
            borderRadius="$3"
            marginBottom="$2"
          >
            <XStack space="$2" alignItems="center" position="relative">
              {hasLoad && (
                <>
                  <Input
                    height={40}
                    flex={2}
                    value={set.weight}
                    onChangeText={(value) => onUpdateSetField(exercise.id, set.id, 'weight', value)}
                    placeholder={t('common.weight')}
                    keyboardType="numeric"
                    borderColor="$inputFieldBorder"
                    backgroundColor="$background"
                    color="$textPrimary"
                    editable={!disabled}
                    opacity={disabled ? 0.6 : 1}
                  />
                  <Text color={colors.white}>{weightUnit === 'lb' ? 'lbs' : 'kg'}</Text>
                </>
              )}

              <Input
                flex={1}
                height={40}
                value={set.reps}
                onChangeText={(value) => onUpdateSetField(exercise.id, set.id, 'reps', value)}
                placeholder={t('common.reps')}
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
                placeholder={t('workout.rir')}
                keyboardType="numeric"
                borderColor="$inputFieldBorder"
                backgroundColor="$background"
                color="$textPrimary"
                editable={!disabled}
                opacity={disabled ? 0.6 : 1}
              />
              <Text color={colors.white}>{t('workout.rir')}</Text>
              <Button
                testID={`remove-set-button-${index}-${setIndex}`}
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
        );
      })}

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
          <Entypo name="circle-with-plus" size={22} color={colors.white} /> {t('workout.addSet')}
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
          <AntDesign name="copy1" size={22} color={colors.white} /> {t('workout.duplicate')}
        </Button>
      </XStack>
    </YStack>
  );
};
