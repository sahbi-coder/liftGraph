import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { YStack, Text, XStack, Button } from 'tamagui';

import { useDependencies } from '@/dependencies/provider';
import { useAuth } from '@/contexts/AuthContext';
import { Program, ProgramExercise, WorkoutExercise } from '@/services/firestore';
import { colors } from '@/theme/colors';
import { DaySelector, ProgramDay as DaySelectorProgramDay } from '@/components/DaySelector';
import { setWorkoutPrefillData } from '@/app/(tabs)/workout/workoutPrefillContext';

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
  const { user } = useAuth();

  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlternatingWeek, setSelectedAlternatingWeek] = useState<0 | 1>(0);

  useEffect(() => {
    if (!programId) {
      Alert.alert('Invalid program', 'Program ID is missing.');
      router.back();
    }
  }, [router, programId]);

  useEffect(() => {
    if (!user || !programId) {
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
          Alert.alert('Program not found', 'We could not find that program.');
          router.back();
          return;
        }

        setProgram(fetchedProgram);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Unable to load program.';
        Alert.alert('Failed to load program', message);
        router.back();
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
  }, [router, services.firestore, user, programId]);

  // Determine active days for DaySelector
  const activeDays = useMemo<DaySelectorProgramDay[]>(() => {
    if (!program) return [];
    if (program.type === 'simple') {
      return program.week.days
        .map((day, index) => (day !== 'rest' ? (`Day${index + 1}` as DaySelectorProgramDay) : null))
        .filter((day): day is DaySelectorProgramDay => day !== null);
    } else if (program.type === 'alternating') {
      // For alternating programs, use the selected week
      return program.alternatingWeeks[selectedAlternatingWeek].days
        .map((day, index) => (day !== 'rest' ? (`Day${index + 1}` as DaySelectorProgramDay) : null))
        .filter((day): day is DaySelectorProgramDay => day !== null);
    } else {
      // For advanced programs, use the first week of the first phase
      if (program.phases.length > 0 && program.phases[0].weeks.length > 0) {
        return program.phases[0].weeks[0].days
          .map((day, index) =>
            day !== 'rest' ? (`Day${index + 1}` as DaySelectorProgramDay) : null,
          )
          .filter((day): day is DaySelectorProgramDay => day !== null);
      }
      return [];
    }
  }, [program, selectedAlternatingWeek]);

  // Get active day exercises for display
  const activeDayExercises = useMemo(() => {
    if (!program) return [];
    if (program.type === 'simple') {
      return program.week.days
        .map((day, index) => {
          if (day === 'rest') return null;
          return {
            dayNumber: index + 1,
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
            dayName: day.name,
            exercises: day.exercises,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    } else {
      // For advanced programs, use the first week of the first phase
      if (program.phases.length > 0 && program.phases[0].weeks.length > 0) {
        return program.phases[0].weeks[0].days
          .map((day, index) => {
            if (day === 'rest') return null;
            return {
              dayNumber: index + 1,
              dayName: day.name,
              exercises: day.exercises,
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);
      }
      return [];
    }
  }, [program, selectedAlternatingWeek]);

  // Transform program exercises to workout exercises
  const transformProgramExercisesToWorkoutExercises = useCallback(
    (programExercises: ProgramExercise[]): WorkoutExercise[] => {
      return programExercises.map((exercise, index) => ({
        exerciseId: exercise.id,
        exerciseOwnerId: exercise.isGlobal ? 'global' : null,
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
      router.push('/(tabs)/workout/create');
    },
    [router, transformProgramExercisesToWorkoutExercises],
  );

  if (!user) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={colors.darkerGray}
        padding="$4"
      >
        <Text color={colors.white} fontSize="$5" textAlign="center">
          Please sign in to view programs.
        </Text>
      </YStack>
    );
  }

  if (isLoading) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={colors.darkerGray}
      >
        <Text color={colors.white}>Loading program...</Text>
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
          Program could not be loaded.
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
              Update Program
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
                  ? 'Simple'
                  : program.type === 'alternating'
                    ? 'Alternating'
                    : 'Advanced'
              } Program`}
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
                {program.type === 'simple' ? 'Weekly Schedule' : 'Alternating Weeks'}
              </Button>
            )}
          </XStack>
        </YStack>

        {program.type === 'simple' || program.type === 'alternating' ? (
          <YStack space="$3">
            <Text color="$textPrimary" fontSize="$6" fontWeight="600">
              {program.type === 'simple' ? 'Weekly Schedule' : 'Alternating Weeks'}
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
                  Week 1
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
                  Week 2
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
                          Day {dayData.dayNumber}
                        </Text>
                        <Text color="$textSecondary" fontSize="$4">
                          {dayData.exercises.length} exercise
                          {dayData.exercises.length !== 1 ? 's' : ''}
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
                        Apply Day
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
                                Sets
                              </Text>
                              <Text color={colors.white} fontSize="$3" fontWeight="500">
                                {exercise.sets.length}
                              </Text>
                            </YStack>
                            {exercise.sets.map((set, setIndex) => (
                              <YStack key={setIndex} space="$1">
                                <Text color="$textSecondary" fontSize="$2">
                                  Set {setIndex + 1}
                                </Text>
                                <XStack gap="$3">
                                  <YStack space="$0.5">
                                    <Text color="$textSecondary" fontSize="$2">
                                      Reps
                                    </Text>
                                    <Text color={colors.white} fontSize="$3" fontWeight="500">
                                      {set.reps}
                                    </Text>
                                  </YStack>
                                  <YStack space="$0.5">
                                    <Text color="$textSecondary" fontSize="$2">
                                      RIR
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
              Program Phases
            </Text>
            {program.phases.map((phase, phaseIndex) => {
              // Use the first week of the phase for display
              const firstWeek = phase.weeks.length > 0 ? phase.weeks[0] : null;
              const phaseActiveDays = firstWeek
                ? firstWeek.days
                    .map((day, index) =>
                      day !== 'rest' ? (`Day${index + 1}` as DaySelectorProgramDay) : null,
                    )
                    .filter((day): day is DaySelectorProgramDay => day !== null)
                : [];

              const phaseActiveDayExercises = firstWeek
                ? firstWeek.days
                    .map((day, index) => {
                      if (day === 'rest') return null;
                      return {
                        dayNumber: index + 1,
                        dayName: day.name,
                        exercises: day.exercises,
                      };
                    })
                    .filter((item): item is NonNullable<typeof item> => item !== null)
                : [];

              return (
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
                  {firstWeek && (
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
                          Week 1
                        </Text>
                        {phase.weeks.length > 1 && (
                          <Text color="$textSecondary" fontSize="$3">
                            (of {phase.weeks.length} weeks)
                          </Text>
                        )}
                      </XStack>
                      <DaySelector value={phaseActiveDays} disabled />
                    </YStack>
                  )}
                  {phaseActiveDayExercises.length > 0 && (
                    <YStack space="$3">
                      {phaseActiveDayExercises.map((dayData, dayIndex) => (
                        <YStack key={dayIndex} space="$2">
                          <XStack
                            alignItems="center"
                            justifyContent="space-between"
                            gap="$2"
                            flexWrap="wrap"
                          >
                            <YStack space="$1" flex={1}>
                              <Text color="$textPrimary" fontSize="$5" fontWeight="600">
                                Day {dayData.dayNumber}
                              </Text>
                              <Text color="$textSecondary" fontSize="$4">
                                {dayData.exercises.length} exercise
                                {dayData.exercises.length !== 1 ? 's' : ''}
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
                              Apply Day
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
                                      Sets
                                    </Text>
                                    <Text color={colors.white} fontSize="$3" fontWeight="500">
                                      {exercise.sets.length}
                                    </Text>
                                  </YStack>
                                  {exercise.sets.map((set, setIndex) => (
                                    <YStack key={setIndex} space="$1">
                                      <Text color="$textSecondary" fontSize="$2">
                                        Set {setIndex + 1}
                                      </Text>
                                      <XStack gap="$3">
                                        <YStack space="$0.5">
                                          <Text color="$textSecondary" fontSize="$2">
                                            Reps
                                          </Text>
                                          <Text color={colors.white} fontSize="$3" fontWeight="500">
                                            {set.reps}
                                          </Text>
                                        </YStack>
                                        <YStack space="$0.5">
                                          <Text color="$textSecondary" fontSize="$2">
                                            RIR
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
              );
            })}
          </YStack>
        )}
      </YStack>
    </ScrollView>
  );
}
