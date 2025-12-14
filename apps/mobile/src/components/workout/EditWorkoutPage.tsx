import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { YStack, Text, Button } from 'tamagui';
import { ActivityIndicator } from 'react-native';

import { colors } from '@/theme/colors';
import { EditWorkoutScreen } from '@/components/workout/EditWorkoutScreen';
import { useWorkout } from '@/hooks/useWorkout';
import { useWorkoutMutations } from '@/hooks/useWorkoutMutations';
import { useAlertModal } from '@/hooks/useAlertModal';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { useTranslation } from '@/hooks/useTranslation';
import { useWorkoutIdFromParams } from '@/hooks/useWorkoutIdFromParams';
import { useEditWorkoutHandlers } from '@/hooks/useEditWorkoutHandlers';
import { useWorkoutDeleteModal } from '@/hooks/useWorkoutDeleteModal';

interface EditWorkoutPageProps {
  exerciseNavigationPath: string;
}

export function EditWorkoutPage({ exerciseNavigationPath }: EditWorkoutPageProps) {
  const router = useRouter();
  const workoutId = useWorkoutIdFromParams();

  const { workout, isLoading, isError, refetch } = useWorkout(workoutId);
  const { isUpdating, isValidating, isUnvalidating, isDeleting } = useWorkoutMutations(workoutId);

  const { AlertModalComponent } = useAlertModal();
  const { t } = useTranslation();

  const {
    isDeleteModalVisible,
    openDeleteModal,
    closeDeleteModal,
    isDeleting: isDeletingWorkout,
    setIsDeleting,
  } = useWorkoutDeleteModal();

  const {
    handleUpdateWorkout,
    handleValidateWorkout,
    handleUnvalidateWorkout,
    handleConfirmDelete: handleConfirmDeleteFromHook,
  } = useEditWorkoutHandlers({ workoutId });

  const handleDeleteWorkout = useCallback(() => {
    openDeleteModal();
  }, [openDeleteModal]);

  const handleConfirmDelete = useCallback(async () => {
    closeDeleteModal();
    try {
      setIsDeleting(true);
      await handleConfirmDeleteFromHook();
    } catch {
      setIsDeleting(false);
    }
  }, [closeDeleteModal, handleConfirmDeleteFromHook, setIsDeleting]);

  // Show loading state
  if (isLoading) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={colors.darkerGray}
      >
        <Text color={colors.white}>{t('workout.loadingWorkout')}</Text>
      </YStack>
    );
  }

  // Render modals at top level so they persist even when workout state changes
  const modals = (
    <>
      <ConfirmationModal
        visible={isDeleteModalVisible}
        title={t('workout.deleteWorkoutConfirm')}
        message={t('workout.deleteWorkoutMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
        confirmButtonColor="#ef4444"
        cancelButtonColor={colors.midGray}
      />
      <AlertModalComponent />
    </>
  );

  // Show error state (but still render modals)
  if (isError && !isDeletingWorkout) {
    return (
      <>
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          backgroundColor={colors.darkerGray}
          padding="$4"
          space="$4"
        >
          <Text color={colors.white} fontSize="$5" textAlign="center">
            {t('workout.failedToLoadWorkout')}
          </Text>
          <Button backgroundColor="$primaryButton" color={colors.white} onPress={() => refetch()}>
            {t('common.retry')}
          </Button>
          <Button
            backgroundColor={colors.midGray}
            color={colors.white}
            onPress={() => router.back()}
          >
            {t('common.back')}
          </Button>
        </YStack>
        {modals}
      </>
    );
  }

  if (!workout && !isDeletingWorkout) {
    return (
      <>
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          backgroundColor={colors.darkerGray}
        >
          <ActivityIndicator size="large" color={colors.niceOrange} />
        </YStack>
        {modals}
      </>
    );
  }

  // If deleting, just show loading with modals (workout might be null)
  if (isDeletingWorkout && !workout) {
    return (
      <>
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          backgroundColor={colors.darkerGray}
        >
          <ActivityIndicator size="large" color={colors.niceOrange} />
        </YStack>
        {modals}
      </>
    );
  }

  return (
    <>
      <EditWorkoutScreen
        workout={workout!}
        onUpdateWorkout={handleUpdateWorkout}
        onValidateWorkout={handleValidateWorkout}
        onUnvalidateWorkout={handleUnvalidateWorkout}
        onDeleteWorkout={handleDeleteWorkout}
        isUpdating={isUpdating}
        isValidating={isValidating || isUnvalidating || isDeleting}
        exerciseNavigationPath={exerciseNavigationPath}
      />
      {modals}
    </>
  );
}
