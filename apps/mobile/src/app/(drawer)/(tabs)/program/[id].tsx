import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { YStack, Text, XStack, Button } from 'tamagui';

import { useDependencies } from '@/dependencies/provider';
import { useAuthenticatedUser } from '@/contexts/AuthContext';
import type { Program, ProgramExercise, WorkoutExercise, ProgramDayLabel } from '@/services';
import { colors } from '@/theme/colors';
import { DaySelector } from '@/components/DaySelector';
import { setWorkoutPrefillData } from '@/contexts/workoutPrefillContext';
import { useAlertModal } from '@/hooks/useAlertModal';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { useTranslation } from '@/hooks/useTranslation';
import { getServiceErrorMessage } from '@/utils/serviceErrors';

export default function ProgramDetailsScreen() {
  const router = useRouter();
  const { id: programIdParam } = useLocalSearchParams<{ id?: string | string[] }>();
  const programId = useMemo(() => {
    if (Array.isArray(programIdParam)) {
      return programIdParam[0];
    }
    return programIdParam;
  }, [programIdParam]);

  const { services } = useDependencies();
  const { user } = useAuthenticatedUser();
  const { t } = useTranslation();

  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlternatingWeek, setSelectedAlternatingWeek] = useState<0 | 1>(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSuccess, showError, AlertModalComponent } = useAlertModal();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  useEffect(() => {
    if (!programId) {
      showError(t('program.programIdMissing'));
      setTimeout(() => {
        router.back();
      }, 2000);
    }
  }, [router, programId, showError, t]);

  useEffect(() => {
    if (!programId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchProgram = async () => {
      try {
        const fetchedProgram = await services.firestore.getProgram(user.uid, programId);

        if (!isMounted) {
          return;
        }

        if (!fetchedProgram) {
          showError(t('program.programNotFound'));
          setTimeout(() => {
            router.back();
          }, 2000);
          return;
        }

        setProgram(fetchedProgram);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message = getServiceErrorMessage(error, t);
        showError(message);
        setTimeout(() => {
          router.back();
        }, 2000);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProgram();

    return () => {
      isMounted = false;
    };
  }, [router, services.firestore, user.uid, programId, showError, t]);

  // Determine active days for DaySelector
  const activeDays = useMemo<ProgramDayLabel[]>(() => {
    if (!program) return [];
    if (program.type === 'simple') {
      return program.week.days
        .map((day, index) => (day !== 'rest' ? `Day${index + 1}` : null))
        .filter((day): day is ProgramDayLabel => day !== null);
    } else if (program.type === 'alternating') {
      // For alternating programs, use the selected week
      return program.alternatingWeeks[selectedAlternatingWeek].days
        .map((day, index) => (day !== 'rest' ? `Day${index + 1}` : null))
        .filter((day): day is ProgramDayLabel => day !== null);
    } else {
      // For advanced programs, return empty array as we'll display all phases/weeks separately
      return [];
    }
  }, [program, selectedAlternatingWeek]);

  // Get active day exercises for display (only used for simple/alternating programs)
  const activeDayExercises = useMemo(() => {
    if (!program) return [];
    if (program.type === 'simple') {
      return program.week.days
        .map((day, index) => {
          if (day === 'rest') return null;
          return {
            dayNumber: index + 1,
            dayLabel: day.label,
            dayName: day.name,
            exercises: day.exercises,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    } else if (program.type === 'alternating') {
      // For alternating programs, use the selected week
      return program.alternatingWeeks[selectedAlternatingWeek].days
        .map((day, index) => {
          if (day === 'rest') return null;
          return {
            dayNumber: index + 1,
            dayLabel: day.label,
            dayName: day.name,
            exercises: day.exercises,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    } else {
      // For advanced programs, return empty array as we'll display all phases/weeks separately
      return [];
    }
  }, [program, selectedAlternatingWeek]);

  // Transform program exercises to workout exercises
  const transformProgramExercisesToWorkoutExercises = useCallback(
    (programExercises: ProgramExercise[]): WorkoutExercise[] => {
      return programExercises.map((exercise, index) => ({
        exerciseId: exercise.id,
        name: exercise.name,
        order: index + 1,
        sets: exercise.sets.map((set) => ({
          weight: 0, // User will fill in weight
          reps: set.reps,
          rir: set.rir,
        })),
      }));
    },
    [],
  );

  // Handle Apply Day button press
  const handleApplyDay = useCallback(
    (exercises: ProgramExercise[]) => {
      const workoutExercises = transformProgramExercisesToWorkoutExercises(exercises);
      setWorkoutPrefillData(workoutExercises);
      router.push('./apply-workout');
    },
    [router, transformProgramExercisesToWorkoutExercises],
  );

  // Handle Delete Program
  const handleDeleteProgram = useCallback(() => {
    if (!programId || !program) {
      return;
    }

    setIsDeleteModalVisible(true);
  }, [programId, program]);

  const handleConfirmDelete = useCallback(async () => {
    setIsDeleteModalVisible(false);
    if (!programId || !program) {
      return;
    }

    setIsDeleting(true);
    try {
      await services.firestore.deleteProgram(user.uid, programId);
      showSuccess(t('program.programDeletedSuccessfully'));
      // Navigate back after showing success message
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      const message = getServiceErrorMessage(error, t);
      showError(message);
    } finally {
      setIsDeleting(false);
    }
  }, [user.uid, programId, program, services.firestore, router, showSuccess, showError, t]);

  if (isLoading) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={colors.darkerGray}
      >
        <Text color={colors.white}>{t('program.loadingProgram')}</Text>
      </YStack>
    );
  }

  if (!program) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={colors.darkerGray}
        padding="$4"
      >
        <Text color={colors.white} fontSize="$5" textAlign="center">
          {t('program.programCouldNotBeLoaded')}
        </Text>
      </YStack>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.darkerGray }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
    >
      <YStack space="$4">
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
              onPress={() => {}}
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
              paddingHorizontal="$1.5"
            >
              {`${
                program.type === 'simple'
                  ? t('program.simpleProgram')
                  : program.type === 'alternating'
                    ? t('program.alternatingProgram')
                    : t('program.advancedProgram')
              }`}
            </Button>
            {(program.type === 'simple' || program.type === 'alternating') && (
              <Button
                disabled
                backgroundColor={colors.midGray}
                color="$textPrimary"
                fontSize="$4"
                paddingHorizontal="$1.5"
                borderWidth={0}
                cursor="default"
                height="auto"
              >
                {program.type === 'simple'
                  ? t('program.weeklySchedule')
                  : t('program.alternatingWeeks')}
              </Button>
            )}
          </XStack>
        </YStack>

        {program.type === 'simple' || program.type === 'alternating' ? (
          <YStack space="$3">
            <Text color="$textPrimary" fontSize="$6" fontWeight="600">
              {program.type === 'simple'
                ? t('program.weeklySchedule')
                : t('program.alternatingWeeks')}
            </Text>
            {program.type === 'alternating' && (
              <XStack space="$2" alignItems="center">
                <Button
                  backgroundColor={
                    selectedAlternatingWeek === 0 ? '$primaryButton' : colors.midGray
                  }
                  color={colors.white}
                  fontSize="$4"
                  borderRadius="$4"
                  borderWidth={0}
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  onPress={() => setSelectedAlternatingWeek(0)}
                >
                  {t('program.week1')}
                </Button>
                <Button
                  backgroundColor={
                    selectedAlternatingWeek === 1 ? '$primaryButton' : colors.midGray
                  }
                  color={colors.white}
                  fontSize="$4"
                  borderRadius="$4"
                  borderWidth={0}
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  onPress={() => setSelectedAlternatingWeek(1)}
                >
                  {t('program.week2')}
                </Button>
              </XStack>
            )}
            <DaySelector value={activeDays} disabled />
            {activeDayExercises.length > 0 && (
              <YStack space="$3" marginTop="$2">
                {activeDayExercises.map((dayData, index) => (
                  <YStack key={index} space="$2">
                    <XStack
                      alignItems="center"
                      justifyContent="space-between"
                      gap="$2"
                      flexWrap="wrap"
                    >
                      <YStack space="$1" flex={1}>
                        <Text color="$textPrimary" fontSize="$5" fontWeight="600">
                          {dayData.dayLabel} {dayData.dayName ? `(${dayData.dayName})` : ''}
                        </Text>
                        <Text color="$textSecondary" fontSize="$4">
                          {dayData.exercises.length}{' '}
                          {dayData.exercises.length !== 1
                            ? t('common.exercises')
                            : t('common.exercise')}
                        </Text>
                      </YStack>
                      <Button
                        backgroundColor={colors.niceOrange}
                        color={colors.white}
                        fontSize="$3"
                        borderRadius="$3"
                        borderWidth={0}
                        paddingHorizontal="$2.5"
                        paddingVertical="$1.5"
                        onPress={() => handleApplyDay(dayData.exercises)}
                      >
                        {t('program.applyDay')}
                      </Button>
                    </XStack>
                    <YStack
                      padding="$3"
                      backgroundColor={colors.midGray}
                      borderRadius="$4"
                      space="$2"
                    >
                      {dayData.exercises.map((exercise, exerciseIndex) => (
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
                            {exercise.sets.map((set, setIndex) => (
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
                            ))}
                          </XStack>
                        </YStack>
                      ))}
                    </YStack>
                  </YStack>
                ))}
              </YStack>
            )}
          </YStack>
        ) : (
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
                    .map((day, index) => (day !== 'rest' ? `Day${index + 1}` : null))
                    .filter((day): day is ProgramDayLabel => day !== null);

                  const weekActiveDayExercises = week.days
                    .map((day, index) => {
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
                          {weekActiveDayExercises.map((dayData, dayIndex) => (
                            <YStack key={dayIndex} space="$2">
                              <XStack
                                alignItems="center"
                                justifyContent="space-between"
                                gap="$2"
                                flexWrap="wrap"
                              >
                                <YStack space="$1" flex={1}>
                                  <Text color="$textPrimary" fontSize="$5" fontWeight="600">
                                    {dayData.dayLabel}{' '}
                                    {dayData.dayName ? `(${dayData.dayName})` : ''}
                                  </Text>
                                  <Text color="$textSecondary" fontSize="$4">
                                    {dayData.exercises.length}{' '}
                                    {dayData.exercises.length !== 1
                                      ? t('common.exercises')
                                      : t('common.exercise')}
                                  </Text>
                                </YStack>
                                <Button
                                  backgroundColor={colors.niceOrange}
                                  color={colors.white}
                                  fontSize="$3"
                                  borderRadius="$3"
                                  borderWidth={0}
                                  paddingHorizontal="$2.5"
                                  paddingVertical="$1.5"
                                  onPress={() => handleApplyDay(dayData.exercises)}
                                >
                                  {t('program.applyDay')}
                                </Button>
                              </XStack>
                              <YStack
                                padding="$3"
                                backgroundColor={colors.midGray}
                                borderRadius="$4"
                                space="$2"
                              >
                                {dayData.exercises.map((exercise, exerciseIndex) => (
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
                                      {exercise.sets.map((set, setIndex) => (
                                        <YStack key={setIndex} space="$1">
                                          <Text color="$textSecondary" fontSize="$2">
                                            {t('common.set')} {setIndex + 1}
                                          </Text>
                                          <XStack gap="$3">
                                            <YStack space="$0.5">
                                              <Text color="$textSecondary" fontSize="$2">
                                                {t('common.reps')}
                                              </Text>
                                              <Text
                                                color={colors.white}
                                                fontSize="$3"
                                                fontWeight="500"
                                              >
                                                {set.reps}
                                              </Text>
                                            </YStack>
                                            <YStack space="$0.5">
                                              <Text color="$textSecondary" fontSize="$2">
                                                {t('workout.rir')}
                                              </Text>
                                              <Text
                                                color={colors.white}
                                                fontSize="$3"
                                                fontWeight="500"
                                              >
                                                {set.rir}
                                              </Text>
                                            </YStack>
                                          </XStack>
                                        </YStack>
                                      ))}
                                    </XStack>
                                  </YStack>
                                ))}
                              </YStack>
                            </YStack>
                          ))}
                        </YStack>
                      )}
                    </YStack>
                  );
                })}
              </YStack>
            ))}
          </YStack>
        )}
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
            onPress={handleDeleteProgram}
            disabled={isDeleting}
            opacity={isDeleting ? 0.5 : 1}
            alignSelf="center"
          >
            {isDeleting ? t('common.deleting') : t('program.deleteProgram')}
          </Button>
        </YStack>
      </YStack>
      <ConfirmationModal
        visible={isDeleteModalVisible}
        title={t('program.deleteProgramConfirm')}
        message={t('program.deleteProgramMessage', { name: program?.name || '' })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        confirmButtonColor="#ef4444"
        cancelButtonColor={colors.midGray}
      />
      <AlertModalComponent />
    </ScrollView>
  );
}
