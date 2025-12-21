import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useDependencies } from '@/dependencies/provider';
import { useAuthenticatedUser } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { getServiceErrorMessage } from '@/utils/serviceErrors';

type UseProgramSaveParams = {
  validateAndConvert: () => any;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
};

export function useProgramSave({
  validateAndConvert,
  showError,
  showSuccess,
}: UseProgramSaveParams) {
  const router = useRouter();
  const { services } = useDependencies();
  const { user } = useAuthenticatedUser();
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    try {
      const programData = validateAndConvert();

      if (!programData) {
        return;
      }

      setIsSaving(true);
      await services.firestore.createProgram(user.uid, programData);

      showSuccess(t('program.programSavedSuccessfully'));
      // Navigate back after showing success message
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      const message = getServiceErrorMessage(error, t);
      showError(message);
    } finally {
      setIsSaving(false);
    }
  }, [user.uid, services.firestore, router, validateAndConvert, showError, showSuccess, t]);

  return {
    handleSave,
    isSaving,
  };
}
