import { useState, useCallback } from 'react';
import type { ProgramType } from './useProgramForm/types';

export function useProgramForm() {
  const [programType, setProgramType] = useState<ProgramType>('simple');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleProgramTypeChange = useCallback((type: ProgramType) => {
    setProgramType(type);
  }, []);

  return {
    programType,
    name,
    description,
    setProgramType: handleProgramTypeChange,
    setName,
    setDescription,
  };
}
