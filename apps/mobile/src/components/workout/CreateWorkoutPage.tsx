import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { Modal } from 'react-native';
import { WorkoutForm } from '@/components/workout/WorkoutForm';
import { useDependencies } from '@/dependencies/provider';
import { useAuthenticatedUser } from '@/contexts/AuthContext';
import type { WorkoutInput } from '@/services';
import { getWorkoutPrefillData, clearWorkoutPrefillData } from '@/contexts/workoutPrefillContext';
import { saveWorkoutDraft, loadWorkoutDraft, clearWorkoutDraft } from '@/utils/workoutDraftStorage';
import { useAlertModal } from '@/hooks/common/useAlertModal';
import { useTranslation } from '@/hooks/common/useTranslation';
import { getServiceErrorMessage } from '@/utils/serviceErrors';
import { Button, Text, XStack, YStack } from 'tamagui';
import { colors } from '@/theme/colors';

type CreateWorkoutPageProps = {
  exerciseNavigationPath: string;
  context: 'create' | 'apply';
};

export function CreateWorkoutPage({ exerciseNavigationPath, context }: CreateWorkoutPageProps) {
  const router = useRouter();
  const navigation = useNavigation();
  const { services } = useDependencies();
  const { user } = useAuthenticatedUser();
  const { t } = useTranslation();
  const { showSuccess, showError, AlertModalComponent } = useAlertModal();

  const [isSaving, setIsSaving] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [initialValues, setInitialValues] = useState<
    { date?: Date | string; notes?: string; exercises?: any[] } | undefined
  >(undefined);
  const [isLoadingDraft, setIsLoadingDraft] = useState(context === 'create');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const currentWorkoutPayloadRef = useRef<WorkoutInput | null>(null);

  const isCreateContext = context === 'create';

  // Check for prefill data synchronously (for apply context only)
  const prefillData = !isCreateContext ? getWorkoutPrefillData() : null;

  const saveDraft = async () => {
    // User decided to stay, save draft (create context only)

    if (currentWorkoutPayloadRef.current) {
      await saveWorkoutDraft(currentWorkoutPayloadRef.current);
    }

    currentWorkoutPayloadRef.current = null;
  };

  const clearDraft = useCallback(async () => {
    await clearWorkoutDraft();
    currentWorkoutPayloadRef.current = null;
  }, []);

  // Load initial values based on context
  useEffect(() => {
    const loadInitialValues = async () => {
      if (isCreateContext) {
        // For create: priority is draft > empty
        const draft = await loadWorkoutDraft();
        if (draft) {
          setInitialValues({
            date: draft.date,
            notes: draft.notes,
            exercises: draft.exercises,
          });
        }
        setIsLoadingDraft(false);
      } else {
        // For apply: only use prefill (checked synchronously above)
        if (prefillData) {
          setInitialValues({ exercises: prefillData.exercises });
          clearWorkoutPrefillData();
        }
        setIsLoadingDraft(false);
      }
    };

    loadInitialValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreateContext]);

  // Intercept navigation to show discard confirmation
  useEffect(() => {
    if (!isCreateContext || !hasUnsavedChanges) {
      return;
    }

    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Don't intercept if we're saving
      if (isSaving) {
        return;
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault();
      unsubscribe();
      if (currentWorkoutPayloadRef.current) {
        setShowDiscardModal(true);
      } else {
        clearDraft();
        router.back();
      }
    });

    return unsubscribe;
  }, [navigation, isSaving, isCreateContext, hasUnsavedChanges]);

  const handleFormChange = useCallback((payload: WorkoutInput | null) => {
    if (payload) {
      // Track that there are unsaved changes
      setHasUnsavedChanges(true);
      // Store current payload for saving draft when modal appears
      currentWorkoutPayloadRef.current = payload;
    } else {
      // Form is invalid
      setHasUnsavedChanges(true);
      currentWorkoutPayloadRef.current = null;
    }
  }, []);

  const handleCreateWorkout = useCallback(
    async (workoutPayload: WorkoutInput) => {
      setIsSaving(true);
      try {
        await services.firestore.createWorkout(user.uid, workoutPayload);
        setHasUnsavedChanges(false);

        // Clear draft on successful save (create context only)
        if (isCreateContext) {
          await clearWorkoutDraft();
        }

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
    [router, services.firestore, user.uid, showSuccess, showError, t, isCreateContext],
  );

  const handleDiscard = useCallback(async () => {
    setShowDiscardModal(false);
    setHasUnsavedChanges(false);

    await clearWorkoutDraft();

    router.back();
  }, [router]);

  const handleKeep = useCallback(async () => {
    setShowDiscardModal(false);
    setHasUnsavedChanges(false);

    // Save draft on keep (create context only)
    await saveDraft();

    router.back();
  }, [saveDraft, router]);

  // Don't render form until draft is loaded (for create context)
  if (isLoadingDraft) {
    return null; // Or a loading spinner if preferred
  }

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
                onPress={handleDiscard}
              >
                {t('workout.discard')}
              </Button>
              <Button backgroundColor={colors.niceOrange} color={colors.white} onPress={handleKeep}>
                {t('workout.keep')}
              </Button>
            </XStack>
          </YStack>
        </YStack>
      </Modal>
    </>
  );
}
