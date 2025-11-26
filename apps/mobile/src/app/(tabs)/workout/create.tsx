import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { WorkoutForm } from '@/components/workout/WorkoutForm';
import { useDependencies } from '@/dependencies/provider';
import { useAuth } from '@/contexts/AuthContext';
import { WorkoutInput } from '@/services/firestore';
import { getWorkoutPrefillData, clearWorkoutPrefillData } from '@/contexts/workoutPrefillContext';
import { AlertModal } from '@/components/AlertModal';

export default function CreateWorkoutScreen() {
  const router = useRouter();
  const { services } = useDependencies();
  const { user } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'info',
  });

  // Check for prefill data synchronously before first render
  const prefillData = getWorkoutPrefillData();
  const [initialExercises] = useState<WorkoutInput['exercises'] | undefined>(
    prefillData ? prefillData.exercises : undefined,
  );

  // Clear prefill data after reading it
  useEffect(() => {
    if (prefillData) {
      clearWorkoutPrefillData();
    }
  }, [prefillData]);

  const handleCreateWorkout = useCallback(
    async (workoutPayload: WorkoutInput) => {
      if (!user) {
        setAlertModal({
          visible: true,
          message: 'Please sign in to save workouts.',
          type: 'error',
        });
        return;
      }

      setIsSaving(true);
      try {
        await services.firestore.createWorkout(user.uid, workoutPayload);
        setAlertModal({
          visible: true,
          message: 'Your workout has been saved successfully.',
          type: 'success',
        });
        // Navigate back after showing success message
        setTimeout(() => {
          router.back();
        }, 1500);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Something went wrong.';
        setAlertModal({
          visible: true,
          message,
          type: 'error',
        });
      } finally {
        setIsSaving(false);
      }
    },
    [router, services.firestore, user],
  );

  return (
    <>
      <WorkoutForm
        initialValues={initialExercises ? { exercises: initialExercises } : undefined}
        onSubmit={handleCreateWorkout}
        isSubmitting={isSaving}
        submitLabel="Create Workout"
      />
      <AlertModal
        visible={alertModal.visible}
        message={alertModal.message}
        type={alertModal.type}
        duration={2000}
        onComplete={() => setAlertModal((prev) => ({ ...prev, visible: false }))}
      />
    </>
  );
}
