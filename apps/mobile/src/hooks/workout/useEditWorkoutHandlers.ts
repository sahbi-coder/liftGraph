import { useCallback } from 'react';
import { useRouter } from 'expo-router';

import { useWorkoutMutations } from '@/hooks/workout/useWorkoutMutations';
import { useTranslation } from '@/hooks/common/useTranslation';
import { getServiceErrorMessage } from '@/utils/serviceErrors';
import type { WorkoutInput } from '@/services';

interface UseEditWorkoutHandlersProps {
  workoutId: string | undefined;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
}

export function useEditWorkoutHandlers({
  workoutId,
  showSuccess,
  showError,
}: UseEditWorkoutHandlersProps) {
  const router = useRouter();

  const { t } = useTranslation();
  const { updateWorkout, validateWorkout, unvalidateWorkout, deleteWorkout } =
    useWorkoutMutations(workoutId);

  const handleUpdateWorkout = useCallback(
    async (workoutPayload: WorkoutInput) => {
      if (!workoutId) {
        showError(t('workout.workoutIdMissing'));
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
    [workoutId, updateWorkout, showSuccess, showError, t],
  );

  const handleValidateWorkout = useCallback(async () => {
    if (!workoutId) {
      showError(t('workout.workoutIdMissing'));
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
  }, [router, workoutId, validateWorkout, showSuccess, showError, t]);

  const handleUnvalidateWorkout = useCallback(async () => {
    if (!workoutId) {
      showError(t('workout.workoutIdMissing'));
      return;
    }

    try {
      await unvalidateWorkout();
      showSuccess(t('workout.canNowEditWorkout'));
    } catch (error) {
      const message = getServiceErrorMessage(error, t);
      showError(message);
    }
  }, [workoutId, unvalidateWorkout, showSuccess, showError, t]);

  const handleConfirmDelete = useCallback(async () => {
    if (!workoutId) {
      showError(t('workout.workoutIdMissing'));
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
  }, [router, workoutId, deleteWorkout, showSuccess, showError, t]);

  return {
    handleUpdateWorkout,
    handleValidateWorkout,
    handleUnvalidateWorkout,
    handleConfirmDelete,
  };
}
