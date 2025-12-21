import React, { useCallback } from 'react';
import { Modal } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import { colors } from '@/theme/colors';
import { useTranslation } from '@/hooks/common/useTranslation';

interface ConfirmationModalProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
}

export function ConfirmationModal({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  confirmButtonColor = colors.niceOrange,
  cancelButtonColor = colors.darkGray,
}: ConfirmationModalProps) {
  const { t } = useTranslation();
  const defaultConfirmText = confirmText ?? t('common.confirm');
  const defaultCancelText = cancelText ?? t('common.cancel');

  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
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
          {title && (
            <Text color={colors.white} fontSize="$6" fontWeight="600">
              {title}
            </Text>
          )}
          <Text color="$textSecondary" fontSize="$4" lineHeight="$1">
            {message}
          </Text>
          <XStack space="$3" justifyContent="flex-end">
            <Button
              backgroundColor={cancelButtonColor}
              color={colors.white}
              borderWidth={1}
              borderColor={colors.white}
              onPress={handleCancel}
              flex={1}
            >
              {defaultCancelText}
            </Button>
            <Button
              backgroundColor={confirmButtonColor}
              color={colors.white}
              onPress={handleConfirm}
              flex={1}
            >
              {defaultConfirmText}
            </Button>
          </XStack>
        </YStack>
      </YStack>
    </Modal>
  );
}
