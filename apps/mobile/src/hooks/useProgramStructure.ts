import { useState, useCallback } from 'react';
import type { ProgramType, ProgramWeekForm, ProgramPhaseForm } from './useProgramForm/types';
import { createWeekForm, createPhaseForm } from './useProgramForm/types';

export function useProgramStructure(programType: ProgramType) {
  // Simple program state - initialize with one week
  const [weeks, setWeeks] = useState<ProgramWeekForm[]>(() => [createWeekForm()]);

  // Alternating program state - initialize with two weeks
  const [alternatingWeeks, setAlternatingWeeks] = useState<ProgramWeekForm[]>(() => [
    createWeekForm(),
    createWeekForm(),
  ]);

  // Advanced program state
  const [phases, setPhases] = useState<ProgramPhaseForm[]>([]);

  const resetStructure = useCallback((type: ProgramType) => {
    if (type === 'simple') {
      setWeeks([createWeekForm()]);
      setAlternatingWeeks([createWeekForm(), createWeekForm()]);
      setPhases([]);
    } else if (type === 'alternating') {
      setWeeks([]);
      setAlternatingWeeks([createWeekForm(), createWeekForm()]);
      setPhases([]);
    } else {
      setWeeks([]);
      setAlternatingWeeks([createWeekForm(), createWeekForm()]);
      setPhases([]);
    }
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

  return {
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
  };
}
