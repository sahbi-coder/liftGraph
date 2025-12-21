import React, { useCallback, useState } from 'react';
import { AlertModal } from '@/components/AlertModal';

export type AlertModalType = 'success' | 'info' | 'warning' | 'error';

export interface AlertModalState {
  visible: boolean;
  message: string;
  type: AlertModalType;
}

export interface UseAlertModalOptions {
  defaultDuration?: number;
}

export interface UseAlertModalResult {
  alertModal: AlertModalState;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  hide: () => void;
  AlertModalComponent: React.ComponentType<{ duration?: number }>;
}

/**
 * Custom hook that manages alert modal state and provides helper functions
 * for showing different types of alerts. Consolidates the alert modal pattern
 * used across multiple screens.
 */
export function useAlertModal({
  defaultDuration = 3000,
}: UseAlertModalOptions = {}): UseAlertModalResult {
  const [alertModal, setAlertModal] = useState<AlertModalState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showSuccess = useCallback((message: string, duration?: number) => {
    setAlertModal({
      visible: true,
      message,
      type: 'success',
    });
  }, []);

  const showError = useCallback((message: string, duration?: number) => {
    setAlertModal({
      visible: true,
      message,
      type: 'error',
    });
  }, []);

  const showWarning = useCallback((message: string, duration?: number) => {
    setAlertModal({
      visible: true,
      message,
      type: 'warning',
    });
  }, []);

  const showInfo = useCallback((message: string, duration?: number) => {
    setAlertModal({
      visible: true,
      message,
      type: 'info',
    });
  }, []);

  const hide = useCallback(() => {
    setAlertModal((prev) => ({ ...prev, visible: false }));
  }, []);

  // Create the component function
  const AlertModalComponent: React.FC<{ duration?: number }> = useCallback(
    ({ duration }: { duration?: number } = {}) => {
      // Use type-specific durations: success messages are typically shorter
      const modalDuration =
        duration !== undefined
          ? duration
          : alertModal.type === 'success'
            ? 2000
            : alertModal.type === 'error'
              ? 4000
              : defaultDuration;

      return React.createElement(AlertModal, {
        visible: alertModal.visible,
        message: alertModal.message,
        type: alertModal.type,
        duration: modalDuration,
        onComplete: hide,
      });
    },
    [alertModal, defaultDuration, hide],
  );

  return {
    alertModal,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hide,
    AlertModalComponent,
  };
}
