import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { WorkoutForm } from '@/components/workout/WorkoutForm';
import { useDependencies } from '@/dependencies/provider';
import { useAuth } from '@/contexts/AuthContext';
import type { WorkoutInput } from '@/services';
import { getWorkoutPrefillData, clearWorkoutPrefillData } from '@/contexts/workoutPrefillContext';
import { useAlertModal } from '@/hooks/useAlertModal';
import { useTranslation } from '@/hooks/useTranslation';

export default function CreateWorkoutScreen() {
  const router = useRouter();
  const { services } = useDependencies();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showSuccess, showError, AlertModalComponent } = useAlertModal();

  const [isSaving, setIsSaving] = useState(false);

  // Check for prefill data synchronously before first render
  const prefillData = getWorkoutPrefillData();
  const [initialExercises] = useState(prefillData ? prefillData.exercises : undefined);

  // Clear prefill data after reading it
  useEffect(() => {
    if (prefillData) {
      clearWorkoutPrefillData();
    }
  }, [prefillData]);

  const handleCreateWorkout = useCallback(
    async (workoutPayload: WorkoutInput) => {
      if (!user) {
        showError(t('workout.pleaseSignInToSave'));
        return;
      }

      setIsSaving(true);
      try {
        await services.firestore.createWorkout(user.uid, workoutPayload);
        showSuccess(t('workout.workoutSavedSuccessfully'));
        // Navigate back after showing success message
        setTimeout(() => {
          router.back();
        }, 1500);
      } catch (error) {
        const message = error instanceof Error ? error.message : t('common.somethingWentWrong');
        showError(message);
      } finally {
        setIsSaving(false);
      }
    },
    [router, services.firestore, user, showSuccess, showError, t],
  );

  return (
    <>
      <WorkoutForm
        initialValues={initialExercises ? { exercises: initialExercises } : undefined}
        onSubmit={handleCreateWorkout}
        isSubmitting={isSaving}
        submitLabel={t('workout.create')}
      />
      <AlertModalComponent duration={2000} />
    </>
  );
}
