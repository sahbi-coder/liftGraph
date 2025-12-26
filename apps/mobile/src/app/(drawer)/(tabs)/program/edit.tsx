import React, { useEffect, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { YStack, Text } from 'tamagui';

import { colors } from '@/theme/colors';
import { useAlertModal } from '@/hooks/common/useAlertModal';
import { useTranslation } from '@/hooks/common/useTranslation';
import { useProgram } from '@/hooks/program/useProgram';
import { useProgramForm } from '@/hooks/program/useProgramForm';
import { useProgramStructure } from '@/hooks/program/useProgramStructure';
import { useProgramDaySelection } from '@/hooks/program/useProgramDaySelection';
import { useProgramExercises } from '@/hooks/program/useProgramExercises';
import { useProgramSets } from '@/hooks/program/useProgramSets';
import { useProgramValidation } from '@/hooks/program/useProgramValidation';
import { useProgramSave } from '@/hooks/program/useProgramSave';
import { ProgramForm } from '@/components/program/ProgramForm';
import { convertProgramToForm } from '@/hooks/program/useProgramForm/convertProgramToForm';

export default function EditProgramScreen() {
  const router = useRouter();
  const { id: programIdParam } = useLocalSearchParams<{ id?: string | string[] }>();
  const programId = useMemo(() => {
    if (Array.isArray(programIdParam)) {
      return programIdParam[0];
    }
    return programIdParam;
  }, [programIdParam]);

  const { t } = useTranslation();
  const { showWarning, showError, showSuccess, AlertModalComponent } = useAlertModal();

  // Fetch program using hook
  const { program, isLoading, isError } = useProgram(programId);

  // Form state - will be initialized from program
  const { programType, name, description, setProgramType, setName, setDescription } =
    useProgramForm();

  // Structure state
  const {
    weeks,
    alternatingWeeks,
    phases,
    setWeeks,
    setAlternatingWeeks,
    setPhases,

    handleUpdateWeekName,
    handleRemoveWeek,
    handleAddPhase,
    handleUpdatePhaseName,
    handleUpdatePhaseDescription,
    handleRemovePhase,
    handleAddWeekToPhase,
    handleUpdateWeekNameInPhase,
    handleRemoveWeekFromPhase,
    handleUpdateDayName,
  } = useProgramStructure(programType);

  // Day selection
  const { handleDaySelectionChange } = useProgramDaySelection({
    programType,
    setWeeks,
    setAlternatingWeeks,
    setPhases,
  });

  // Exercises
  const { handleOpenExercisePicker, handleRemoveExercise } = useProgramExercises({
    programType,
    weeks,
    alternatingWeeks,
    phases,
    setWeeks,
    setAlternatingWeeks,
    setPhases,
  });

  // Sets
  const { handleAddSet, handleRemoveSet, handleUpdateSetField, handleDuplicateLastSet } =
    useProgramSets({
      programType,
      setWeeks,
      setAlternatingWeeks,
      setPhases,
      showWarning,
      t,
    });

  // Validation
  const { validateAndConvert } = useProgramValidation({
    name,
    description,
    programType,
    weeks,
    alternatingWeeks,
    phases,
    showError,
    t,
  });

  // Save
  const { handleSave, isSaving } = useProgramSave({
    validateAndConvert,
    showError,
    showSuccess,
    programId,
  });

  // Handle missing program ID
  useEffect(() => {
    if (!programId) {
      showError(t('program.programIdMissing'));
      setTimeout(() => {
        router.back();
      }, 2000);
    }
  }, [programId, showError, t, router]);

  // Handle error state
  useEffect(() => {
    if (isError) {
      showError(t('program.programNotFound'));
      setTimeout(() => {
        router.back();
      }, 2000);
    }
  }, [isError, showError, t, router]);

  // Initialize form when program is loaded
  useEffect(() => {
    if (program) {
      // Convert program to form data
      const formData = convertProgramToForm(program);

      // Initialize form state
      setProgramType(formData.programType);
      setName(formData.name);
      setDescription(formData.description);
      setWeeks(formData.weeks);
      if (formData.alternatingWeeks) {
        setAlternatingWeeks(formData.alternatingWeeks);
      }
      setPhases(formData.phases);
    }
  }, [program, setProgramType, setName, setDescription, setWeeks, setAlternatingWeeks, setPhases]);

  // Note: We don't reset structure when program type changes in edit mode
  // because the program type should remain the same as the loaded program

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
      <ProgramForm
        programType={programType}
        name={name}
        description={description}
        weeks={weeks}
        alternatingWeeks={alternatingWeeks}
        phases={phases}
        setName={setName}
        setDescription={setDescription}
        setProgramType={setProgramType}
        handleUpdateWeekName={handleUpdateWeekName}
        handleRemoveWeek={handleRemoveWeek}
        handleAddPhase={handleAddPhase}
        handleUpdatePhaseName={handleUpdatePhaseName}
        handleUpdatePhaseDescription={handleUpdatePhaseDescription}
        handleRemovePhase={handleRemovePhase}
        handleAddWeekToPhase={handleAddWeekToPhase}
        handleUpdateWeekNameInPhase={handleUpdateWeekNameInPhase}
        handleRemoveWeekFromPhase={handleRemoveWeekFromPhase}
        handleDaySelectionChange={handleDaySelectionChange}
        handleUpdateDayName={handleUpdateDayName}
        handleOpenExercisePicker={handleOpenExercisePicker}
        handleRemoveExercise={handleRemoveExercise}
        handleAddSet={handleAddSet}
        handleRemoveSet={handleRemoveSet}
        handleUpdateSetField={handleUpdateSetField}
        handleDuplicateLastSet={handleDuplicateLastSet}
        handleSave={handleSave}
        isSaving={isSaving}
        saveButtonText={t('program.update')}
      />
      <AlertModalComponent />
    </>
  );
}
