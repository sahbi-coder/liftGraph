import React, { useEffect } from 'react';

import { useAlertModal } from '@/hooks/common/useAlertModal';
import { useTranslation } from '@/hooks/common/useTranslation';
import { useProgramForm } from '@/hooks/program/useProgramForm';
import { useProgramStructure } from '@/hooks/program/useProgramStructure';
import { useProgramDaySelection } from '@/hooks/program/useProgramDaySelection';
import { useProgramExercises } from '@/hooks/program/useProgramExercises';
import { useProgramSets } from '@/hooks/program/useProgramSets';
import { useProgramValidation } from '@/hooks/program/useProgramValidation';
import { useProgramSave } from '@/hooks/program/useProgramSave';
import { ProgramForm } from '@/components/program/ProgramForm';

export default function CreateProgramScreen() {
  const { t } = useTranslation();
  const { showWarning, showError, showSuccess, AlertModalComponent } = useAlertModal();

  // Form state
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
    resetStructure,
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
  const { handleAddSet, handleRemoveSet, handleUpdateSetField } = useProgramSets({
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
  const { handleSave, isSaving } = useProgramSave({ validateAndConvert, showError, showSuccess });

  // Reset structure when program type changes
  useEffect(() => {
    resetStructure(programType);
  }, [programType, resetStructure]);

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
        handleSave={handleSave}
        isSaving={isSaving}
      />
      <AlertModalComponent />
    </>
  );
}
