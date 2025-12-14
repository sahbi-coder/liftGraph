import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { Modal } from 'react-native';
import { WorkoutForm } from '@/components/workout/WorkoutForm';
import { useDependencies } from '@/dependencies/provider';
import { useAuth } from '@/contexts/AuthContext';
import type { WorkoutInput } from '@/services';
import { getWorkoutPrefillData, clearWorkoutPrefillData } from '@/contexts/workoutPrefillContext';
import {
  getWorkoutDraft,
  setWorkoutDraft,
  clearWorkoutDraft,
} from '@/contexts/workoutDraftContext';
import { useAlertModal } from '@/hooks/useAlertModal';
import { useTranslation } from '@/hooks/useTranslation';
import { getServiceErrorMessage } from '@/utils/serviceErrors';
import { Button, Text, XStack, YStack } from 'tamagui';
import { colors } from '@/theme/colors';

type CreateWorkoutPageProps = {
  exerciseNavigationPath: string;
};

export function CreateWorkoutPage({ exerciseNavigationPath }: CreateWorkoutPageProps) {
  const router = useRouter();
  const navigation = useNavigation();
  const { services } = useDependencies();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showSuccess, showError, AlertModalComponent } = useAlertModal();

  const [isSaving, setIsSaving] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const pendingNavigationRef = useRef<(() => void) | null>(null);
  const hasUnsavedChangesRef = useRef(false);

  // Check for prefill data synchronously before first render
  const prefillData = getWorkoutPrefillData();
  const draftData = getWorkoutDraft();

  // Determine initial values: prefill takes priority, then draft, then nothing
  const [initialValues] = useState(() => {
    if (prefillData) {
      return { exercises: prefillData.exercises };
    }
    if (draftData) {
      return {
        date: draftData.date,
        notes: draftData.notes,
        exercises: draftData.exercises,
      };
    }
    return undefined;
  });

  // Clear prefill data after reading it
  useEffect(() => {
    if (prefillData) {
      clearWorkoutPrefillData();
    }
  }, [prefillData]);

  // Intercept navigation to show discard confirmation
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Don't intercept if we're saving or if there are no unsaved changes
      if (isSaving || !hasUnsavedChangesRef.current) {
        return;
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault();

      // Show confirmation modal
      setShowDiscardModal(true);
      // Store the navigation action so we can dispatch it later
      pendingNavigationRef.current = () => {
        navigation.dispatch(e.data.action);
      };
    });

    return unsubscribe;
  }, [navigation, isSaving]);

  const handleFormChange = useCallback((payload: WorkoutInput | null) => {
    if (payload) {
      // Save draft when form has valid data
      hasUnsavedChangesRef.current = true;
      setWorkoutDraft({
        date: payload.date instanceof Date ? payload.date.toUTCString() : payload.date,
        notes: payload.notes,
        exercises: payload.exercises,
      });
    } else {
      // Form is invalid, but we might still want to save partial data
      // For now, we'll only save when form is valid
      hasUnsavedChangesRef.current = false;
    }
  }, []);

  const handleCreateWorkout = useCallback(
    async (workoutPayload: WorkoutInput) => {
      if (!user) {
        showError(t('workout.pleaseSignInToSave'));
        return;
      }

      setIsSaving(true);
      try {
        await services.firestore.createWorkout(user.uid, workoutPayload);
        // Clear draft on successful creation
        clearWorkoutDraft();
        hasUnsavedChangesRef.current = false;
        showSuccess(t('workout.workoutSavedSuccessfully'));
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
    },
    [router, services.firestore, user, showSuccess, showError, t],
  );

  const handleDiscardDraft = useCallback(() => {
    setShowDiscardModal(false);
    if (pendingNavigationRef.current) {
      // Clear draft and navigate away
      clearWorkoutDraft();
      hasUnsavedChangesRef.current = false;
      pendingNavigationRef.current();
      pendingNavigationRef.current = null;
    }
  }, []);

  const handleKeepDraft = useCallback(() => {
    // Navigate away but keep the draft (draft is already saved)
    setShowDiscardModal(false);
    if (pendingNavigationRef.current) {
      // Don't clear draft, just navigate away
      // Reset the flag so we don't show the modal again if they come back immediately
      hasUnsavedChangesRef.current = false;
      pendingNavigationRef.current();
      pendingNavigationRef.current = null;
    }
  }, []);

  return (
    <>
      <WorkoutForm
        initialValues={initialValues}
        onSubmit={handleCreateWorkout}
        isSubmitting={isSaving}
        submitLabel={t('workout.create')}
        exerciseNavigationPath={exerciseNavigationPath}
        onFormChange={handleFormChange}
      />
      <AlertModalComponent duration={2000} />

      <Modal
        visible={showDiscardModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDiscardModal(false)}
      >
        <YStack
          flex={1}
          backgroundColor="rgba(0, 0, 0, 0.6)"
          justifyContent="center"
          alignItems="center"
          padding="$4"
        >
          <YStack
            width="90%"
            maxWidth={420}
            backgroundColor={colors.midGray}
            borderRadius="$4"
            padding="$4"
            space="$4"
          >
            <Text color={colors.white} fontSize="$6" fontWeight="600">
              {t('workout.unsavedChanges')}
            </Text>
            <Text color="$textSecondary" fontSize="$4">
              {t('workout.unsavedChangesMessage')}
            </Text>
            <XStack space="$3" justifyContent="flex-end">
              <Button
                backgroundColor={colors.midGray}
                color={colors.white}
                borderWidth={1}
                borderColor={colors.white}
                onPress={handleDiscardDraft}
              >
                {t('workout.discard')}
              </Button>
              <Button
                backgroundColor={colors.niceOrange}
                color={colors.white}
                onPress={handleKeepDraft}
              >
                {t('workout.keepDraft')}
              </Button>
            </XStack>
          </YStack>
        </YStack>
      </Modal>
    </>
  );
}
