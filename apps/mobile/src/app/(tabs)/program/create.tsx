import React, { useCallback, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input, Text, TextArea, XStack, YStack } from 'tamagui';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';

import { useDependencies } from '@/dependencies/provider';
import { useAuth } from '@/contexts/AuthContext';
import {
  ProgramInput,
  SimpleProgramInput,
  AdvancedProgramInput,
  ProgramExercise,
  ProgramSet,
  ProgramWeek,
  ProgramPhase,
} from '@/services/firestore';
import { colors } from '@/theme/colors';
import { ExerciseSelection, ExerciseSelectionContext } from '@/app/(tabs)/workout/types';
import {
  setExercisePickerCallback,
  clearExercisePickerCallback,
} from '@/app/(tabs)/workout/exercisePickerContext';

type ProgramType = 'simple' | 'advanced';

type ProgramSetForm = {
  id: string;
  reps: string;
  rpe: string;
};

type ProgramExerciseForm = {
  id: string;
  exerciseId: string;
  name: string;
  isGlobal: boolean;
  sets: ProgramSetForm[];
};

type ProgramWeekForm = {
  id: string;
  name: string;
  exercises: (ProgramExerciseForm | null)[];
};

type ProgramPhaseForm = {
  id: string;
  name: string;
  description: string;
  weeks: ProgramWeekForm[];
};

const createSetForm = (set?: ProgramSet): ProgramSetForm => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  reps: set ? String(set.reps) : '',
  rpe: set ? String(set.rpe) : '',
});

const createExerciseForm = (exercise: ExerciseSelection): ProgramExerciseForm => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  exerciseId: exercise.id,
  name: exercise.name,
  isGlobal: exercise.source === 'library',
  sets: [createSetForm()],
});

const createWeekForm = (name: string = ''): ProgramWeekForm => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name,
  exercises: [],
});

const createPhaseForm = (name: string = '', description: string = ''): ProgramPhaseForm => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name,
  description,
  weeks: [],
});

export default function CreateProgramScreen() {
  const router = useRouter();
  const { services } = useDependencies();
  const { user } = useAuth();

  const [programType, setProgramType] = useState<ProgramType>('simple');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Simple program state
  const [weeks, setWeeks] = useState<ProgramWeekForm[]>([]);

  // Advanced program state
  const [phases, setPhases] = useState<ProgramPhaseForm[]>([]);

  const handleSelectExercise = useCallback(
    (exercise: ExerciseSelection, context?: ExerciseSelectionContext) => {
      console.log('handleSelectExercise called with:', { exercise, context, programType });

      if (!context?.weekId) {
        console.log('No weekId in context, returning early');
        return;
      }

      const newExercise = createExerciseForm(exercise);
      const weekId = context.weekId;
      const phaseId = context.phaseId;

      console.log('Adding exercise to week:', weekId, 'phase:', phaseId);

      if (programType === 'simple') {
        console.log('Updating simple program weeks');
        setWeeks((prev) => {
          const weekExists = prev.some((week) => week.id === weekId);
          console.log(
            'Week exists:',
            weekExists,
            'Week ID:',
            weekId,
            'All week IDs:',
            prev.map((w) => w.id),
          );

          if (!weekExists) {
            console.error('Week not found! Cannot add exercise.');
            return prev;
          }

          const updated = prev.map((week) =>
            week.id === weekId ? { ...week, exercises: [...week.exercises, newExercise] } : week,
          );
          console.log('Updated weeks:', updated);
          return updated;
        });
      } else if (phaseId) {
        console.log('Updating advanced program phases');
        setPhases((prev) => {
          const updated = prev.map((phase) =>
            phase.id === phaseId
              ? {
                  ...phase,
                  weeks: phase.weeks.map((week) =>
                    week.id === weekId
                      ? { ...week, exercises: [...week.exercises, newExercise] }
                      : week,
                  ),
                }
              : phase,
          );
          console.log('Updated phases:', updated);
          return updated;
        });
      } else {
        console.log('No phaseId for advanced program, not updating');
      }
    },
    [programType],
  );

  const handleOpenExercisePicker = useCallback(
    (weekId: string, phaseId?: string) => {
      const context: ExerciseSelectionContext = { weekId, phaseId };
      setExercisePickerCallback(handleSelectExercise, context, '/(tabs)/program/create');
      router.push('/(tabs)/program/exercises');
    },
    [handleSelectExercise, router],
  );

  // Clear the callback when component unmounts (e.g., when switching tabs)
  // Don't clear on focus loss because that happens when navigating to exercise picker
  React.useEffect(() => {
    return () => {
      // Only clear on unmount, not on focus loss
      clearExercisePickerCallback();
    };
  }, []);

  const handleAddWeek = useCallback(() => {
    if (programType === 'simple') {
      setWeeks((prev) => [...prev, createWeekForm()]);
    }
  }, [programType]);

  const handleUpdateWeekName = useCallback(
    (weekId: string, name: string) => {
      if (programType === 'simple') {
        setWeeks((prev) => prev.map((week) => (week.id === weekId ? { ...week, name } : week)));
      }
    },
    [programType],
  );

  const handleRemoveWeek = useCallback(
    (weekId: string) => {
      if (programType === 'simple') {
        setWeeks((prev) => prev.filter((week) => week.id !== weekId));
      }
    },
    [programType],
  );

  const handleAddPhase = useCallback(() => {
    if (programType === 'advanced') {
      setPhases((prev) => [...prev, createPhaseForm()]);
    }
  }, [programType]);

  const handleUpdatePhaseName = useCallback(
    (phaseId: string, name: string) => {
      if (programType === 'advanced') {
        setPhases((prev) =>
          prev.map((phase) => (phase.id === phaseId ? { ...phase, name } : phase)),
        );
      }
    },
    [programType],
  );

  const handleUpdatePhaseDescription = useCallback(
    (phaseId: string, description: string) => {
      if (programType === 'advanced') {
        setPhases((prev) =>
          prev.map((phase) => (phase.id === phaseId ? { ...phase, description } : phase)),
        );
      }
    },
    [programType],
  );

  const handleRemovePhase = useCallback(
    (phaseId: string) => {
      if (programType === 'advanced') {
        setPhases((prev) => prev.filter((phase) => phase.id !== phaseId));
      }
    },
    [programType],
  );

  const handleAddWeekToPhase = useCallback(
    (phaseId: string) => {
      if (programType === 'advanced') {
        setPhases((prev) =>
          prev.map((phase) =>
            phase.id === phaseId ? { ...phase, weeks: [...phase.weeks, createWeekForm()] } : phase,
          ),
        );
      }
    },
    [programType],
  );

  const handleUpdateWeekNameInPhase = useCallback(
    (phaseId: string, weekId: string, name: string) => {
      if (programType === 'advanced') {
        setPhases((prev) =>
          prev.map((phase) =>
            phase.id === phaseId
              ? {
                  ...phase,
                  weeks: phase.weeks.map((week) => (week.id === weekId ? { ...week, name } : week)),
                }
              : phase,
          ),
        );
      }
    },
    [programType],
  );

  const handleRemoveWeekFromPhase = useCallback(
    (phaseId: string, weekId: string) => {
      if (programType === 'advanced') {
        setPhases((prev) =>
          prev.map((phase) =>
            phase.id === phaseId
              ? { ...phase, weeks: phase.weeks.filter((week) => week.id !== weekId) }
              : phase,
          ),
        );
      }
    },
    [programType],
  );

  const handleRemoveExercise = useCallback(
    (weekId: string, exerciseId: string, phaseId?: string) => {
      if (programType === 'simple') {
        setWeeks((prev) =>
          prev.map((week) =>
            week.id === weekId
              ? { ...week, exercises: week.exercises.filter((ex) => ex?.id !== exerciseId) }
              : week,
          ),
        );
      } else if (phaseId) {
        setPhases((prev) =>
          prev.map((phase) =>
            phase.id === phaseId
              ? {
                  ...phase,
                  weeks: phase.weeks.map((week) =>
                    week.id === weekId
                      ? { ...week, exercises: week.exercises.filter((ex) => ex?.id !== exerciseId) }
                      : week,
                  ),
                }
              : phase,
          ),
        );
      }
    },
    [programType],
  );

  const handleAddSet = useCallback(
    (weekId: string, exerciseId: string, phaseId?: string) => {
      if (programType === 'simple') {
        setWeeks((prev) =>
          prev.map((week) =>
            week.id === weekId
              ? {
                  ...week,
                  exercises: week.exercises.map((ex) =>
                    ex && ex.id === exerciseId
                      ? { ...ex, sets: [...ex.sets, createSetForm()] }
                      : ex,
                  ),
                }
              : week,
          ),
        );
      } else if (phaseId) {
        setPhases((prev) =>
          prev.map((phase) =>
            phase.id === phaseId
              ? {
                  ...phase,
                  weeks: phase.weeks.map((week) =>
                    week.id === weekId
                      ? {
                          ...week,
                          exercises: week.exercises.map((ex) =>
                            ex && ex.id === exerciseId
                              ? { ...ex, sets: [...ex.sets, createSetForm()] }
                              : ex,
                          ),
                        }
                      : week,
                  ),
                }
              : phase,
          ),
        );
      }
    },
    [programType],
  );

  const handleRemoveSet = useCallback(
    (weekId: string, exerciseId: string, setId: string, phaseId?: string) => {
      if (programType === 'simple') {
        setWeeks((prev) =>
          prev.map((week) =>
            week.id === weekId
              ? {
                  ...week,
                  exercises: week.exercises.map((ex) => {
                    if (!ex || ex.id !== exerciseId) return ex;
                    if (ex.sets.length === 1) {
                      Alert.alert('Cannot remove set', 'Each exercise must have at least one set.');
                      return ex;
                    }
                    return { ...ex, sets: ex.sets.filter((set) => set.id !== setId) };
                  }),
                }
              : week,
          ),
        );
      } else if (phaseId) {
        setPhases((prev) =>
          prev.map((phase) =>
            phase.id === phaseId
              ? {
                  ...phase,
                  weeks: phase.weeks.map((week) =>
                    week.id === weekId
                      ? {
                          ...week,
                          exercises: week.exercises.map((ex) => {
                            if (!ex || ex.id !== exerciseId) return ex;
                            if (ex.sets.length === 1) {
                              Alert.alert(
                                'Cannot remove set',
                                'Each exercise must have at least one set.',
                              );
                              return ex;
                            }
                            return { ...ex, sets: ex.sets.filter((set) => set.id !== setId) };
                          }),
                        }
                      : week,
                  ),
                }
              : phase,
          ),
        );
      }
    },
    [programType],
  );

  const handleUpdateSetField = useCallback(
    (
      weekId: string,
      exerciseId: string,
      setId: string,
      field: 'reps' | 'rpe',
      value: string,
      phaseId?: string,
    ) => {
      if (programType === 'simple') {
        setWeeks((prev) =>
          prev.map((week) =>
            week.id === weekId
              ? {
                  ...week,
                  exercises: week.exercises.map((ex) =>
                    ex && ex.id === exerciseId
                      ? {
                          ...ex,
                          sets: ex.sets.map((set) =>
                            set.id === setId ? { ...set, [field]: value } : set,
                          ),
                        }
                      : ex,
                  ),
                }
              : week,
          ),
        );
      } else if (phaseId) {
        setPhases((prev) =>
          prev.map((phase) =>
            phase.id === phaseId
              ? {
                  ...phase,
                  weeks: phase.weeks.map((week) =>
                    week.id === weekId
                      ? {
                          ...week,
                          exercises: week.exercises.map((ex) =>
                            ex && ex.id === exerciseId
                              ? {
                                  ...ex,
                                  sets: ex.sets.map((set) =>
                                    set.id === setId ? { ...set, [field]: value } : set,
                                  ),
                                }
                              : ex,
                          ),
                        }
                      : week,
                  ),
                }
              : phase,
          ),
        );
      }
    },
    [programType],
  );

  const validateAndConvert = useCallback((): ProgramInput | null => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Program name is required.');
      return null;
    }

    if (!description.trim()) {
      Alert.alert('Validation Error', 'Program description is required.');
      return null;
    }

    if (programType === 'simple') {
      if (weeks.length === 0) {
        Alert.alert('Validation Error', 'Simple program must have at least one week.');
        return null;
      }

      const convertedWeeks: ProgramWeek[] = weeks.map((week) => {
        const exercises: ProgramExercise[] = week.exercises
          .filter((ex): ex is ProgramExerciseForm => ex !== null)
          .map((ex) => {
            const sets: ProgramSet[] = ex.sets
              .filter((set) => set.reps.trim() && set.rpe.trim())
              .map((set) => ({
                reps: Number(set.reps),
                rpe: Number(set.rpe),
              }));

            if (sets.length === 0) {
              throw new Error(`Exercise "${ex.name}" must have at least one valid set.`);
            }

            return {
              name: ex.name,
              id: ex.exerciseId,
              isGlobal: ex.isGlobal,
              sets,
            };
          });

        return {
          name: week.name,
          exercises: exercises.length > 0 ? exercises : [],
        };
      });

      const simpleProgram: SimpleProgramInput = {
        name: name.trim(),
        description: description.trim(),
        type: 'simple',
        weeks: convertedWeeks,
      };

      return simpleProgram;
    } else {
      if (phases.length === 0) {
        Alert.alert('Validation Error', 'Advanced program must have at least one phase.');
        return null;
      }

      const convertedPhases: ProgramPhase[] = phases.map((phase) => {
        if (!phase.name.trim()) {
          throw new Error('All phases must have a name.');
        }

        const weeks: ProgramWeek[] = phase.weeks.map((week) => {
          const exercises: ProgramExercise[] = week.exercises
            .filter((ex): ex is ProgramExerciseForm => ex !== null)
            .map((ex) => {
              const sets: ProgramSet[] = ex.sets
                .filter((set) => set.reps.trim() && set.rpe.trim())
                .map((set) => ({
                  reps: Number(set.reps),
                  rpe: Number(set.rpe),
                }));

              if (sets.length === 0) {
                throw new Error(`Exercise "${ex.name}" must have at least one valid set.`);
              }

              return {
                name: ex.name,
                id: ex.exerciseId,
                isGlobal: ex.isGlobal,
                sets,
              };
            });

          return {
            name: week.name,
            exercises: exercises.length > 0 ? exercises : [],
          };
        });

        return {
          name: phase.name.trim(),
          description: phase.description.trim(),
          weeks,
        };
      });

      const advancedProgram: AdvancedProgramInput = {
        name: name.trim(),
        description: description.trim(),
        type: 'advanced',
        phases: convertedPhases,
      };

      return advancedProgram;
    }
  }, [name, description, programType, weeks, phases]);

  const handleSave = useCallback(async () => {
    if (!user) {
      Alert.alert('Not signed in', 'Please sign in to create programs.');
      return;
    }

    try {
      const programData = validateAndConvert();
      if (!programData) {
        return;
      }

      setIsSaving(true);
      await services.firestore.createProgram(user.uid, programData);
      Alert.alert('Program created', 'Your program has been saved successfully.');
      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Failed to create program', message);
    } finally {
      setIsSaving(false);
    }
  }, [user, services.firestore, router, validateAndConvert]);

  const renderExerciseCard = useCallback(
    (exercise: ProgramExerciseForm, weekId: string, exerciseIndex: number, phaseId?: string) => (
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
            onPress={() => handleRemoveExercise(weekId, exercise.id, phaseId)}
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
                  handleUpdateSetField(weekId, exercise.id, set.id, 'reps', value, phaseId)
                }
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
                value={set.rpe}
                onChangeText={(value) =>
                  handleUpdateSetField(weekId, exercise.id, set.id, 'rpe', value, phaseId)
                }
                placeholder="RPE"
                keyboardType="numeric"
                borderColor="$inputFieldBorder"
                backgroundColor="$background"
                color="$textPrimary"
              />
              <Text color={colors.white}>RPE</Text>
              <Button
                size="$2"
                variant="outlined"
                color={colors.white}
                onPress={() => handleRemoveSet(weekId, exercise.id, set.id, phaseId)}
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
          onPress={() => handleAddSet(weekId, exercise.id, phaseId)}
        >
          <Entypo name="circle-with-plus" size={22} color={colors.white} /> Add Set
        </Button>
      </YStack>
    ),
    [handleRemoveExercise, handleAddSet, handleRemoveSet, handleUpdateSetField],
  );

  const renderWeek = useCallback(
    (week: ProgramWeekForm, weekIndex: number, phaseId?: string) => (
      <YStack
        key={week.id}
        padding="$3"
        backgroundColor={colors.midGray}
        borderRadius="$4"
        space="$3"
        marginBottom="$3"
      >
        <XStack space="$2" alignItems="center">
          <Input
            flex={1}
            value={week.name}
            onChangeText={(value) =>
              phaseId
                ? handleUpdateWeekNameInPhase(phaseId, week.id, value)
                : handleUpdateWeekName(week.id, value)
            }
            placeholder={`Week ${weekIndex + 1} name`}
            borderColor="$inputFieldBorder"
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

        {week.exercises.map((exercise, index) =>
          exercise ? renderExerciseCard(exercise, week.id, index, phaseId) : null,
        )}

        <Button
          size="$3"
          backgroundColor="$secondaryButton"
          color="$secondaryButtonText"
          fontWeight="600"
          borderRadius="$4"
          onPress={() => handleOpenExercisePicker(week.id, phaseId)}
        >
          <Entypo name="circle-with-plus" size={22} color={colors.white} /> Add Exercise
        </Button>
      </YStack>
    ),
    [
      renderExerciseCard,
      handleOpenExercisePicker,
      handleUpdateWeekName,
      handleUpdateWeekNameInPhase,
      handleRemoveWeek,
      handleRemoveWeekFromPhase,
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
            Program Type
          </Text>
          <XStack space="$2">
            <Button
              flex={1}
              backgroundColor={programType === 'simple' ? '$primaryButton' : colors.midGray}
              color={colors.white}
              onPress={() => {
                setProgramType('simple');
                setPhases([]);
              }}
            >
              Simple
            </Button>
            <Button
              flex={1}
              backgroundColor={programType === 'advanced' ? '$primaryButton' : colors.midGray}
              color={colors.white}
              onPress={() => {
                setProgramType('advanced');
                setWeeks([]);
              }}
            >
              Advanced
            </Button>
          </XStack>
        </YStack>

        <YStack space="$2">
          <Text color="$textPrimary" fontSize="$6" fontWeight="600">
            Program Name
          </Text>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Enter program name"
            borderColor="$inputFieldBorder"
            backgroundColor="$inputFieldBackground"
            color="$textPrimary"
          />
        </YStack>

        <YStack space="$2">
          <Text color="$textPrimary" fontSize="$6" fontWeight="600">
            Description
          </Text>
          <TextArea
            value={description}
            onChangeText={setDescription}
            placeholder="Enter program description"
            borderColor="$inputFieldBorder"
            backgroundColor="$inputFieldBackground"
            color="$textPrimary"
            minHeight={100}
          />
        </YStack>

        {programType === 'simple' ? (
          <YStack space="$3">
            <XStack alignItems="center" justifyContent="space-between">
              <Text color="$textPrimary" fontSize="$6" fontWeight="600">
                Weeks
              </Text>
              <Button
                size="$3"
                backgroundColor="$secondaryButton"
                color="$secondaryButtonText"
                onPress={handleAddWeek}
              >
                <Entypo name="circle-with-plus" size={20} color={colors.white} /> Add Week
              </Button>
            </XStack>

            {weeks.map((week, index) => renderWeek(week, index))}
          </YStack>
        ) : (
          <YStack space="$3">
            <XStack alignItems="center" justifyContent="space-between">
              <Text color="$textPrimary" fontSize="$6" fontWeight="600">
                Phases
              </Text>
              <Button
                size="$3"
                backgroundColor="$secondaryButton"
                color="$secondaryButtonText"
                onPress={handleAddPhase}
              >
                <Entypo name="circle-with-plus" size={20} color={colors.white} /> Add Phase
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
                <XStack space="$2" alignItems="center">
                  <Input
                    flex={1}
                    value={phase.name}
                    onChangeText={(value) => handleUpdatePhaseName(phase.id, value)}
                    placeholder={`Phase ${phaseIndex + 1} name`}
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

                <TextArea
                  value={phase.description}
                  onChangeText={(value) => handleUpdatePhaseDescription(phase.id, value)}
                  placeholder="Phase description"
                  borderColor="$inputFieldBorder"
                  backgroundColor="$background"
                  color="$textPrimary"
                  minHeight={80}
                />

                <XStack alignItems="center" justifyContent="space-between">
                  <Text color="$textPrimary" fontSize="$5" fontWeight="600">
                    Weeks
                  </Text>
                  <Button
                    size="$3"
                    backgroundColor="$secondaryButton"
                    color="$secondaryButtonText"
                    onPress={() => handleAddWeekToPhase(phase.id)}
                  >
                    <Entypo name="circle-with-plus" size={20} color={colors.white} /> Add Week
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
          {isSaving ? 'Creating...' : 'Create Program'}
        </Button>
      </YStack>
    </ScrollView>
  );
}
