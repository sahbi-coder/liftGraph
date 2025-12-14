import { useCallback } from 'react';
import { useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { useWorkoutMutations } from '@/hooks/useWorkoutMutations';
import { useAlertModal } from '@/hooks/useAlertModal';
import { useTranslation } from '@/hooks/useTranslation';
import { getServiceErrorMessage } from '@/utils/serviceErrors';
import type { WorkoutInput } from '@/services';

interface UseEditWorkoutHandlersProps {
  workoutId: string | undefined;
}

export function useEditWorkoutHandlers({ workoutId }: UseEditWorkoutHandlersProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError } = useAlertModal();
  const { t } = useTranslation();
  const { updateWorkout, validateWorkout, unvalidateWorkout, deleteWorkout } =
    useWorkoutMutations(workoutId);

  const handleUpdateWorkout = useCallback(
    async (workoutPayload: WorkoutInput) => {
      if (!user || !workoutId) {
        showError(t('workout.pleaseSignInToEdit'));
        return;
      }

      try {
        await updateWorkout(workoutPayload);
        showSuccess(t('workout.workoutUpdatedSuccessfully'));
      } catch (error) {
        const message = getServiceErrorMessage(error, t);
        showError(message);
      }
    },
    [user, workoutId, updateWorkout, showSuccess, showError, t],
  );

  const handleValidateWorkout = useCallback(async () => {
    if (!user || !workoutId) {
      showError(t('workout.pleaseSignInToValidate'));
      return;
    }

    try {
      await validateWorkout();
      showSuccess(t('workout.workoutMarkedAsComplete'));
      // Navigate back after showing success message
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      const message = getServiceErrorMessage(error, t);
      showError(message);
    }
  }, [router, user, workoutId, validateWorkout, showSuccess, showError, t]);

  const handleUnvalidateWorkout = useCallback(async () => {
    if (!user || !workoutId) {
      showError(t('workout.pleaseSignInToUnvalidate'));
      return;
    }

    try {
      await unvalidateWorkout();
      showSuccess(t('workout.canNowEditWorkout'));
    } catch (error) {
      const message = getServiceErrorMessage(error, t);
      showError(message);
    }
  }, [user, workoutId, unvalidateWorkout, showSuccess, showError, t]);

  const handleConfirmDelete = useCallback(async () => {
    if (!user || !workoutId) {
      showError(t('workout.pleaseSignInToDelete'));
      return;
    }

    try {
      await deleteWorkout();
      showSuccess(t('workout.workoutDeletedSuccessfully'));
      // Navigate back after alert is shown (2 seconds for success alerts)
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      const message = getServiceErrorMessage(error, t);
      showError(message);
      throw error; // Re-throw so caller can handle loading state
    }
  }, [router, user, workoutId, deleteWorkout, showSuccess, showError, t]);

  return {
    handleUpdateWorkout,
    handleValidateWorkout,
    handleUnvalidateWorkout,
    handleConfirmDelete,
  };
}
