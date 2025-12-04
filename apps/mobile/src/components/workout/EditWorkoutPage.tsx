import React, { useCallback, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter, useSegments } from 'expo-router';
import { YStack, Text, Button } from 'tamagui';
import { ActivityIndicator } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/theme/colors';
import { EditWorkoutScreen } from '@/components/workout/EditWorkoutScreen';
import { useWorkout } from '@/hooks/useWorkout';
import { useWorkoutMutations } from '@/hooks/useWorkoutMutations';
import { useAlertModal } from '@/hooks/useAlertModal';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { useTranslation } from '@/hooks/useTranslation';

export function EditWorkoutPage() {
  const router = useRouter();
  const segments = useSegments();
  const { workoutId: workoutIdParam } = useLocalSearchParams<{ workoutId?: string | string[] }>();
  const workoutId = useMemo(() => {
    if (Array.isArray(workoutIdParam)) {
      return workoutIdParam[0];
    }
    return workoutIdParam;
  }, [workoutIdParam]);

  // Detect if we're in schedule or workout context based on route segments
  const exerciseNavigationPath = useMemo(() => {
    const pathString = segments.join('/');
    if (pathString.includes('schedule')) {
      return '/(drawer)/(tabs)/schedule/exercises';
    }
    return '/(drawer)/(tabs)/workout/exercises';
  }, [segments]);

  const { user } = useAuth();
  const { workout, isLoading, isError, refetch } = useWorkout(workoutId);
  const {
    updateWorkout,
    isUpdating,
    validateWorkout,
    isValidating,
    unvalidateWorkout,
    isUnvalidating,
    deleteWorkout,
    isDeleting,
  } = useWorkoutMutations(workoutId);

  const { showSuccess, showError, AlertModalComponent } = useAlertModal();
  const { t } = useTranslation();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeletingWorkout, setIsDeletingWorkout] = useState(false);

  const handleUpdateWorkout = useCallback(
    async (workoutPayload: Parameters<typeof updateWorkout>[0]) => {
      if (!user || !workoutId) {
        showError(t('workout.pleaseSignInToEdit'));
        return;
      }

      try {
        await updateWorkout(workoutPayload);
        showSuccess(t('workout.workoutUpdatedSuccessfully'));
      } catch (error) {
        const message = error instanceof Error ? error.message : t('common.somethingWentWrong');
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
      const message = error instanceof Error ? error.message : t('common.somethingWentWrong');
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
      const message = error instanceof Error ? error.message : t('common.somethingWentWrong');
      showError(message);
    }
  }, [user, workoutId, unvalidateWorkout, showSuccess, showError, t]);

  const handleDeleteWorkout = useCallback(() => {
    setIsDeleteModalVisible(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    setIsDeleteModalVisible(false);
    if (!user || !workoutId) {
      showError(t('workout.pleaseSignInToDelete'));
      return;
    }

    try {
      setIsDeletingWorkout(true);
      await deleteWorkout();
      showSuccess(t('workout.workoutDeletedSuccessfully'));
      // Navigate back after alert is shown (2 seconds for success alerts)
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      setIsDeletingWorkout(false);
      const message = error instanceof Error ? error.message : t('common.somethingWentWrong');
      showError(message);
    }
  }, [router, user, workoutId, deleteWorkout, showSuccess, showError, t]);

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
        onCancel={() => setIsDeleteModalVisible(false)}
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
