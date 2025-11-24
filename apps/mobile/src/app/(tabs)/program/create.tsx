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
  AlternatingProgramInput,
  AdvancedProgramInput,
  ProgramExercise,
  ProgramSet,
  ProgramWeek,
  ProgramPhase,
  ProgramDay,
} from '@/services/firestore';
import { colors } from '@/theme/colors';
import { ExerciseSelection, ExerciseSelectionContext } from '@/app/(tabs)/workout/types';
import {
  setExercisePickerCallback,
  clearExercisePickerCallback,
} from '@/app/(tabs)/workout/exercisePickerContext';
import { DaySelector, type ProgramDay as DaySelectorDay } from '@/components/DaySelector';

type ProgramType = 'simple' | 'alternating' | 'advanced';

type ProgramSetForm = {
  id: string;
  reps: string;
  rir: string;
};

type ProgramExerciseForm = {
  id: string;
  exerciseId: string;
  name: string;
  isGlobal: boolean;
  sets: ProgramSetForm[];
};

type ProgramDayForm = {
  exercises: ProgramExerciseForm[];
};

type ProgramWeekForm = {
  id: string;
  name: string;
  days: ('rest' | ProgramDayForm)[];
  selectedDays: DaySelectorDay[];
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
  rir: set ? String(set.rir) : '',
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
  days: ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest'],
  selectedDays: [],
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

  // Simple program state - initialize with one week
  const [weeks, setWeeks] = useState<ProgramWeekForm[]>(() => [createWeekForm()]);

  // Alternating program state - initialize with two weeks
  const [alternatingWeeks, setAlternatingWeeks] = useState<ProgramWeekForm[]>(() => [
    createWeekForm(),
    createWeekForm(),
  ]);

  // Advanced program state
  const [phases, setPhases] = useState<ProgramPhaseForm[]>([]);

  const handleDaySelectionChange = useCallback(
    (weekId: string, selectedDays: DaySelectorDay[], phaseId?: string) => {
      const dayMap: Record<DaySelectorDay, number> = {
        Day1: 0,
        Day2: 1,
        Day3: 2,
        Day4: 3,
        Day5: 4,
        Day6: 5,
        Day7: 6,
      };

      if (programType === 'simple') {
        setWeeks((prev) =>
          prev.map((week) => {
            if (week.id !== weekId) return week;

            const newDays: ('rest' | ProgramDayForm)[] = [...week.days];
            const selectedIndices = new Set(selectedDays.map((day) => dayMap[day]));

            // Update days array: selected days become ProgramDayForm, unselected become 'rest'
            for (let i = 0; i < 7; i++) {
              if (selectedIndices.has(i)) {
                // If it was 'rest', create new day form, otherwise keep existing
                if (newDays[i] === 'rest') {
                  newDays[i] = { exercises: [] };
                }
              } else {
                // If it was a day form, convert to 'rest'
                newDays[i] = 'rest';
              }
            }

            return { ...week, days: newDays, selectedDays };
          }),
        );
      } else if (programType === 'alternating') {
        setAlternatingWeeks((prev) =>
          prev.map((week) => {
            if (week.id !== weekId) return week;

            const newDays: ('rest' | ProgramDayForm)[] = [...week.days];
            const selectedIndices = new Set(selectedDays.map((day) => dayMap[day]));

            for (let i = 0; i < 7; i++) {
              if (selectedIndices.has(i)) {
                if (newDays[i] === 'rest') {
                  newDays[i] = { exercises: [] };
                }
              } else {
                newDays[i] = 'rest';
              }
            }

            return { ...week, days: newDays, selectedDays };
          }),
        );
      } else if (phaseId) {
        setPhases((prev) =>
          prev.map((phase) => {
            if (phase.id !== phaseId) return phase;

            return {
              ...phase,
              weeks: phase.weeks.map((week) => {
                if (week.id !== weekId) return week;

                const newDays: ('rest' | ProgramDayForm)[] = [...week.days];
                const selectedIndices = new Set(selectedDays.map((day) => dayMap[day]));

                for (let i = 0; i < 7; i++) {
                  if (selectedIndices.has(i)) {
                    if (newDays[i] === 'rest') {
                      newDays[i] = { exercises: [] };
                    }
                  } else {
                    newDays[i] = 'rest';
                  }
                }

                return { ...week, days: newDays, selectedDays };
              }),
            };
          }),
        );
      }
    },
    [programType],
  );

  const handleSelectExercise = useCallback(
    (exercise: ExerciseSelection, context?: ExerciseSelectionContext) => {
      console.log('handleSelectExercise called with:', { exercise, context, programType });

      if (!context?.weekId || !context?.dayId) {
        console.log('No weekId or dayId in context, returning early');
        return;
      }

      const newExercise = createExerciseForm(exercise);
      const weekId = context.weekId;
      const phaseId = context.phaseId;
      const dayId = context.dayId as DaySelectorDay;
      const dayIndex = { Day1: 0, Day2: 1, Day3: 2, Day4: 3, Day5: 4, Day6: 5, Day7: 6 }[dayId];

      if (dayIndex === undefined) {
        console.error('Invalid dayId:', dayId);
        return;
      }

      console.log('Adding exercise to week:', weekId, 'day:', dayId, 'phase:', phaseId);

      if (programType === 'simple') {
        setWeeks((prev) => {
          const week = prev.find((w) => w.id === weekId);
          if (!week) {
            console.error('Week not found! Cannot add exercise.');
            return prev;
          }

          const newDays = [...week.days];
          const day = newDays[dayIndex];

          if (day === 'rest') {
            console.error('Cannot add exercise to rest day');
            return prev;
          }

          newDays[dayIndex] = {
            ...day,
            exercises: [...day.exercises, newExercise],
          };

          return prev.map((w) => (w.id === weekId ? { ...w, days: newDays } : w));
        });
      } else if (programType === 'alternating') {
        setAlternatingWeeks((prev) => {
          const week = prev.find((w) => w.id === weekId);
          if (!week) {
            console.error('Week not found! Cannot add exercise.');
            return prev;
          }

          const newDays = [...week.days];
          const day = newDays[dayIndex];

          if (day === 'rest') {
            console.error('Cannot add exercise to rest day');
            return prev;
          }

          newDays[dayIndex] = {
            ...day,
            exercises: [...day.exercises, newExercise],
          };

          return prev.map((w) => (w.id === weekId ? { ...w, days: newDays } : w));
        });
      } else if (phaseId) {
        setPhases((prev) => {
          return prev.map((phase) => {
            if (phase.id !== phaseId) return phase;

            return {
              ...phase,
              weeks: phase.weeks.map((week) => {
                if (week.id !== weekId) return week;

                const newDays = [...week.days];
                const day = newDays[dayIndex];

                if (day === 'rest') {
                  console.error('Cannot add exercise to rest day');
                  return week;
                }

                newDays[dayIndex] = {
                  ...day,
                  exercises: [...day.exercises, newExercise],
                };

                return { ...week, days: newDays };
              }),
            };
          });
        });
      }
    },
    [programType],
  );

  const handleOpenExercisePicker = useCallback(
    (weekId: string, dayId: DaySelectorDay, phaseId?: string) => {
      const context: ExerciseSelectionContext = { weekId, phaseId, dayId };
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

  const handleUpdateWeekName = useCallback(
    (weekId: string, name: string) => {
      if (programType === 'simple') {
        setWeeks((prev) => prev.map((week) => (week.id === weekId ? { ...week, name } : week)));
      } else if (programType === 'alternating') {
        setAlternatingWeeks((prev) =>
          prev.map((week) => (week.id === weekId ? { ...week, name } : week)),
        );
      }
    },
    [programType],
  );

  const handleRemoveWeek = useCallback(
    (weekId: string) => {
      if (programType === 'simple') {
        setWeeks((prev) => prev.filter((week) => week.id !== weekId));
      }
      // Note: Alternating programs always need exactly 2 weeks, so we don't allow removal
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
    (weekId: string, dayId: DaySelectorDay, exerciseId: string, phaseId?: string) => {
      const dayIndex = { Day1: 0, Day2: 1, Day3: 2, Day4: 3, Day5: 4, Day6: 5, Day7: 6 }[dayId];
      if (dayIndex === undefined) return;

      if (programType === 'simple') {
        setWeeks((prev) =>
          prev.map((week) => {
            if (week.id !== weekId) return week;
            const newDays = [...week.days];
            const day = newDays[dayIndex];
            if (day === 'rest') return week;

            newDays[dayIndex] = {
              ...day,
              exercises: day.exercises.filter((ex) => ex.id !== exerciseId),
            };
            return { ...week, days: newDays };
          }),
        );
      } else if (programType === 'alternating') {
        setAlternatingWeeks((prev) =>
          prev.map((week) => {
            if (week.id !== weekId) return week;
            const newDays = [...week.days];
            const day = newDays[dayIndex];
            if (day === 'rest') return week;

            newDays[dayIndex] = {
              ...day,
              exercises: day.exercises.filter((ex) => ex.id !== exerciseId),
            };
            return { ...week, days: newDays };
          }),
        );
      } else if (phaseId) {
        setPhases((prev) =>
          prev.map((phase) => {
            if (phase.id !== phaseId) return phase;
            return {
              ...phase,
              weeks: phase.weeks.map((week) => {
                if (week.id !== weekId) return week;
                const newDays = [...week.days];
                const day = newDays[dayIndex];
                if (day === 'rest') return week;

                newDays[dayIndex] = {
                  ...day,
                  exercises: day.exercises.filter((ex) => ex.id !== exerciseId),
                };
                return { ...week, days: newDays };
              }),
            };
          }),
        );
      }
    },
    [programType],
  );

  const handleAddSet = useCallback(
    (weekId: string, dayId: DaySelectorDay, exerciseId: string, phaseId?: string) => {
      const dayIndex = { Day1: 0, Day2: 1, Day3: 2, Day4: 3, Day5: 4, Day6: 5, Day7: 6 }[dayId];
      if (dayIndex === undefined) return;

      if (programType === 'simple') {
        setWeeks((prev) =>
          prev.map((week) => {
            if (week.id !== weekId) return week;
            const newDays = [...week.days];
            const day = newDays[dayIndex];
            if (day === 'rest') return week;

            newDays[dayIndex] = {
              ...day,
              exercises: day.exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, sets: [...ex.sets, createSetForm()] } : ex,
              ),
            };
            return { ...week, days: newDays };
          }),
        );
      } else if (programType === 'alternating') {
        setAlternatingWeeks((prev) =>
          prev.map((week) => {
            if (week.id !== weekId) return week;
            const newDays = [...week.days];
            const day = newDays[dayIndex];
            if (day === 'rest') return week;

            newDays[dayIndex] = {
              ...day,
              exercises: day.exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, sets: [...ex.sets, createSetForm()] } : ex,
              ),
            };
            return { ...week, days: newDays };
          }),
        );
      } else if (phaseId) {
        setPhases((prev) =>
          prev.map((phase) => {
            if (phase.id !== phaseId) return phase;
            return {
              ...phase,
              weeks: phase.weeks.map((week) => {
                if (week.id !== weekId) return week;
                const newDays = [...week.days];
                const day = newDays[dayIndex];
                if (day === 'rest') return week;

                newDays[dayIndex] = {
                  ...day,
                  exercises: day.exercises.map((ex) =>
                    ex.id === exerciseId ? { ...ex, sets: [...ex.sets, createSetForm()] } : ex,
                  ),
                };
                return { ...week, days: newDays };
              }),
            };
          }),
        );
      }
    },
    [programType],
  );

  const handleRemoveSet = useCallback(
    (
      weekId: string,
      dayId: DaySelectorDay,
      exerciseId: string,
      setId: string,
      phaseId?: string,
    ) => {
      const dayIndex = { Day1: 0, Day2: 1, Day3: 2, Day4: 3, Day5: 4, Day6: 5, Day7: 6 }[dayId];
      if (dayIndex === undefined) return;

      if (programType === 'simple') {
        setWeeks((prev) =>
          prev.map((week) => {
            if (week.id !== weekId) return week;
            const newDays = [...week.days];
            const day = newDays[dayIndex];
            if (day === 'rest') return week;

            newDays[dayIndex] = {
              ...day,
              exercises: day.exercises.map((ex) => {
                if (ex.id !== exerciseId) return ex;
                if (ex.sets.length === 1) {
                  Alert.alert('Cannot remove set', 'Each exercise must have at least one set.');
                  return ex;
                }
                return { ...ex, sets: ex.sets.filter((set) => set.id !== setId) };
              }),
            };
            return { ...week, days: newDays };
          }),
        );
      } else if (programType === 'alternating') {
        setAlternatingWeeks((prev) =>
          prev.map((week) => {
            if (week.id !== weekId) return week;
            const newDays = [...week.days];
            const day = newDays[dayIndex];
            if (day === 'rest') return week;

            newDays[dayIndex] = {
              ...day,
              exercises: day.exercises.map((ex) => {
                if (ex.id !== exerciseId) return ex;
                if (ex.sets.length === 1) {
                  Alert.alert('Cannot remove set', 'Each exercise must have at least one set.');
                  return ex;
                }
                return { ...ex, sets: ex.sets.filter((set) => set.id !== setId) };
              }),
            };
            return { ...week, days: newDays };
          }),
        );
      } else if (phaseId) {
        setPhases((prev) =>
          prev.map((phase) => {
            if (phase.id !== phaseId) return phase;
            return {
              ...phase,
              weeks: phase.weeks.map((week) => {
                if (week.id !== weekId) return week;
                const newDays = [...week.days];
                const day = newDays[dayIndex];
                if (day === 'rest') return week;

                newDays[dayIndex] = {
                  ...day,
                  exercises: day.exercises.map((ex) => {
                    if (ex.id !== exerciseId) return ex;
                    if (ex.sets.length === 1) {
                      Alert.alert('Cannot remove set', 'Each exercise must have at least one set.');
                      return ex;
                    }
                    return { ...ex, sets: ex.sets.filter((set) => set.id !== setId) };
                  }),
                };
                return { ...week, days: newDays };
              }),
            };
          }),
        );
      }
    },
    [programType],
  );

  const handleUpdateSetField = useCallback(
    (
      weekId: string,
      dayId: DaySelectorDay,
      exerciseId: string,
      setId: string,
      field: 'reps' | 'rir',
      value: string,
      phaseId?: string,
    ) => {
      const dayIndex = { Day1: 0, Day2: 1, Day3: 2, Day4: 3, Day5: 4, Day6: 5, Day7: 6 }[dayId];
      if (dayIndex === undefined) return;

      if (programType === 'simple') {
        setWeeks((prev) =>
          prev.map((week) => {
            if (week.id !== weekId) return week;
            const newDays = [...week.days];
            const day = newDays[dayIndex];
            if (day === 'rest') return week;

            newDays[dayIndex] = {
              ...day,
              exercises: day.exercises.map((ex) =>
                ex.id === exerciseId
                  ? {
                      ...ex,
                      sets: ex.sets.map((set) =>
                        set.id === setId ? { ...set, [field]: value } : set,
                      ),
                    }
                  : ex,
              ),
            };
            return { ...week, days: newDays };
          }),
        );
      } else if (programType === 'alternating') {
        setAlternatingWeeks((prev) =>
          prev.map((week) => {
            if (week.id !== weekId) return week;
            const newDays = [...week.days];
            const day = newDays[dayIndex];
            if (day === 'rest') return week;

            newDays[dayIndex] = {
              ...day,
              exercises: day.exercises.map((ex) =>
                ex.id === exerciseId
                  ? {
                      ...ex,
                      sets: ex.sets.map((set) =>
                        set.id === setId ? { ...set, [field]: value } : set,
                      ),
                    }
                  : ex,
              ),
            };
            return { ...week, days: newDays };
          }),
        );
      } else if (phaseId) {
        setPhases((prev) =>
          prev.map((phase) => {
            if (phase.id !== phaseId) return phase;
            return {
              ...phase,
              weeks: phase.weeks.map((week) => {
                if (week.id !== weekId) return week;
                const newDays = [...week.days];
                const day = newDays[dayIndex];
                if (day === 'rest') return week;

                newDays[dayIndex] = {
                  ...day,
                  exercises: day.exercises.map((ex) =>
                    ex.id === exerciseId
                      ? {
                          ...ex,
                          sets: ex.sets.map((set) =>
                            set.id === setId ? { ...set, [field]: value } : set,
                          ),
                        }
                      : ex,
                  ),
                };
                return { ...week, days: newDays };
              }),
            };
          }),
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

      // Simple programs use only the first week
      const week = weeks[0];
      const dayLabels: DaySelectorDay[] = ['Day1', 'Day2', 'Day3', 'Day4', 'Day5', 'Day6', 'Day7'];
      const convertedDays: ProgramDay[] = week.days.map((day, dayIndex) => {
        if (day === 'rest') {
          return 'rest' as const;
        }

        const exercises: ProgramExercise[] = day.exercises.map((ex) => {
          const sets: ProgramSet[] = ex.sets
            .filter((set) => set.reps.trim() && set.rir.trim())
            .map((set) => ({
              reps: Number(set.reps),
              rir: Number(set.rir),
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
          name: dayLabels[dayIndex],
          exercises,
        };
      });

      const convertedWeek: ProgramWeek = {
        days: convertedDays,
      };

      const simpleProgram: SimpleProgramInput = {
        name: name.trim(),
        description: description.trim(),
        type: 'simple',
        week: convertedWeek,
      };

      return simpleProgram;
    } else if (programType === 'alternating') {
      if (alternatingWeeks.length !== 2) {
        Alert.alert('Validation Error', 'Alternating program must have exactly two weeks.');
        return null;
      }

      const dayLabels: DaySelectorDay[] = ['Day1', 'Day2', 'Day3', 'Day4', 'Day5', 'Day6', 'Day7'];

      const convertWeek = (week: ProgramWeekForm): ProgramWeek => {
        const convertedDays: ProgramDay[] = week.days.map((day, dayIndex) => {
          if (day === 'rest') {
            return 'rest' as const;
          }

          const exercises: ProgramExercise[] = day.exercises.map((ex) => {
            const sets: ProgramSet[] = ex.sets
              .filter((set) => set.reps.trim() && set.rir.trim())
              .map((set) => ({
                reps: Number(set.reps),
                rir: Number(set.rir),
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
            name: dayLabels[dayIndex],
            exercises,
          };
        });

        return {
          days: convertedDays,
        };
      };

      const convertedWeeks: [ProgramWeek, ProgramWeek] = [
        convertWeek(alternatingWeeks[0]),
        convertWeek(alternatingWeeks[1]),
      ];

      const alternatingProgram: AlternatingProgramInput = {
        name: name.trim(),
        description: description.trim(),
        type: 'alternating',
        alternatingWeeks: convertedWeeks,
      };

      return alternatingProgram;
    } else {
      if (phases.length === 0) {
        Alert.alert('Validation Error', 'Advanced program must have at least one phase.');
        return null;
      }

      const convertedPhases: ProgramPhase[] = phases.map((phase) => {
        if (!phase.name.trim()) {
          throw new Error('All phases must have a name.');
        }

        if (phase.weeks.length === 0) {
          throw new Error(`Phase "${phase.name}" must have at least one week.`);
        }

        const dayLabels: DaySelectorDay[] = [
          'Day1',
          'Day2',
          'Day3',
          'Day4',
          'Day5',
          'Day6',
          'Day7',
        ];
        const convertedWeeks: ProgramWeek[] = phase.weeks.map((week) => {
          const convertedDays: ProgramDay[] = week.days.map((day, dayIndex) => {
            if (day === 'rest') {
              return 'rest' as const;
            }

            const exercises: ProgramExercise[] = day.exercises.map((ex) => {
              const sets: ProgramSet[] = ex.sets
                .filter((set) => set.reps.trim() && set.rir.trim())
                .map((set) => ({
                  reps: Number(set.reps),
                  rir: Number(set.rir),
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
              name: dayLabels[dayIndex],
              exercises,
            };
          });

          return {
            days: convertedDays,
          };
        });

        return {
          name: phase.name.trim(),
          description: phase.description.trim(),
          weeks: convertedWeeks,
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
  }, [name, description, programType, weeks, alternatingWeeks, phases]);

  const handleSave = useCallback(async () => {
    if (!user) {
      Alert.alert('Not signed in', 'Please sign in to create programs.');
      return;
    }

    try {
      const programData = validateAndConvert();
      // console.log('programData', programData.phases[0].weeks);

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
    (
      exercise: ProgramExerciseForm,
      weekId: string,
      dayId: DaySelectorDay,
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
                onChangeText={(value) =>
                  handleUpdateSetField(weekId, dayId, exercise.id, set.id, 'rir', value, phaseId)
                }
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
                onPress={() => handleRemoveSet(weekId, dayId, exercise.id, set.id, phaseId)}
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
          onPress={() => handleAddSet(weekId, dayId, exercise.id, phaseId)}
        >
          <Entypo name="circle-with-plus" size={22} color={colors.white} /> Add Set
        </Button>
      </YStack>
    ),
    [handleRemoveExercise, handleAddSet, handleRemoveSet, handleUpdateSetField],
  );

  const renderWeek = useCallback(
    (week: ProgramWeekForm, weekIndex: number, phaseId?: string) => {
      const dayLabels: DaySelectorDay[] = ['Day1', 'Day2', 'Day3', 'Day4', 'Day5', 'Day6', 'Day7'];

      return (
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

          <YStack space="$2">
            <Text color="$textPrimary" fontSize="$4" fontWeight="600">
              Select Active Days
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
                <Text color="$textPrimary" fontSize="$5" fontWeight="600">
                  {dayId}
                </Text>
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
                  <Entypo name="circle-with-plus" size={22} color={colors.white} /> Add Exercise to{' '}
                  {dayId}
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
          <YStack space="$2">
            <XStack space="$2">
              <Button
                flex={1}
                backgroundColor={programType === 'simple' ? '$primaryButton' : colors.midGray}
                color={colors.white}
                onPress={() => {
                  setProgramType('simple');
                  setPhases([]);
                  setAlternatingWeeks([createWeekForm(), createWeekForm()]);
                  setWeeks([createWeekForm()]);
                }}
              >
                Simple
              </Button>
              <Button
                flex={1}
                backgroundColor={programType === 'alternating' ? '$primaryButton' : colors.midGray}
                color={colors.white}
                onPress={() => {
                  setProgramType('alternating');
                  setPhases([]);
                  setWeeks([]);
                  setAlternatingWeeks([createWeekForm(), createWeekForm()]);
                }}
              >
                Alternating
              </Button>
            </XStack>
            <XStack space="$2" justifyContent="center">
              <Button
                flex={0.5}
                backgroundColor={programType === 'advanced' ? '$primaryButton' : colors.midGray}
                color={colors.white}
                onPress={() => {
                  setProgramType('advanced');
                  setWeeks([]);
                  setAlternatingWeeks([createWeekForm(), createWeekForm()]);
                }}
              >
                Advanced
              </Button>
            </XStack>
          </YStack>
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
            <Text color="$textPrimary" fontSize="$6" fontWeight="600">
              Week
            </Text>

            {weeks.map((week, index) => renderWeek(week, index))}
          </YStack>
        ) : programType === 'alternating' ? (
          <YStack space="$3">
            <Text color="$textPrimary" fontSize="$6" fontWeight="600">
              Alternating Weeks
            </Text>
            <Text color="$textSecondary" fontSize="$4">
              Define two weeks that will alternate
            </Text>

            {alternatingWeeks.map((week, index) => renderWeek(week, index))}
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
