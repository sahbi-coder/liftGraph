import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { YStack, Text } from 'tamagui';

import { colors } from '@/theme/colors';
import { useAlertModal } from '@/hooks/common/useAlertModal';
import { useTranslation } from '@/hooks/common/useTranslation';
import { useProgram } from '@/hooks/program/useProgram';
import type { Program, ProgramDayLabel, ProgramExercise, WorkoutExercise } from '@/services';
import { setWorkoutPrefillData } from '@/contexts/workoutPrefillContext';
import { getServiceErrorMessage } from '@/utils/serviceErrors';
import { useDependencies } from '@/dependencies/provider';
import { useAuthenticatedUser } from '@/contexts/AuthContext';
import { ProgramDetails } from '@/components/program/ProgramDetails';

function ProgramDetailsContainer({ program, programId }: { program: Program; programId: string }) {
  const router = useRouter();
  const { services } = useDependencies();
  const { user } = useAuthenticatedUser();
  const { t } = useTranslation();
  const { showSuccess, showError, AlertModalComponent } = useAlertModal();

  const [selectedAlternatingWeek, setSelectedAlternatingWeek] = useState<0 | 1>(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  // Determine active days for DaySelector
  const activeDays = useMemo<ProgramDayLabel[]>(() => {
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
    setIsDeleteModalVisible(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    setIsDeleteModalVisible(false);

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
  }, [user.uid, programId, services.firestore, router, showSuccess, showError, t]);

  return (
    <>
      <ProgramDetails
        program={program}
        programId={programId}
        selectedAlternatingWeek={selectedAlternatingWeek}
        onSelectAlternatingWeek={setSelectedAlternatingWeek}
        activeDays={activeDays}
        activeDayExercises={activeDayExercises}
        onApplyDay={handleApplyDay}
        onDeleteProgram={handleDeleteProgram}
        isDeleting={isDeleting}
        isDeleteModalVisible={isDeleteModalVisible}
        onCloseDeleteModal={() => setIsDeleteModalVisible(false)}
        onConfirmDelete={handleConfirmDelete}
      />
      <AlertModalComponent />
    </>
  );
}

export default function ProgramDetailsScreen() {
  const router = useRouter();
  const { id: programIdParam } = useLocalSearchParams<{ id: string | string[] }>();
  const programId = useMemo(() => {
    if (Array.isArray(programIdParam)) {
      return programIdParam[0];
    }
    return programIdParam;
  }, [programIdParam]);

  const { t } = useTranslation();
  const { showError, AlertModalComponent } = useAlertModal();

  const { program, isLoading, isError } = useProgram(programId);

  useEffect(() => {
    if (isError) {
      showError(t('program.programNotFound'));
      setTimeout(() => {
        router.back();
      }, 2000);
    }
  }, [isError, showError, t, router]);

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
    <>
      <ProgramDetailsContainer program={program} programId={programId!} />
      <AlertModalComponent />
    </>
  );
}
