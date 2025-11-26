import React, { useEffect, useCallback, useState } from 'react';
import { Modal, Pressable } from 'react-native';
import { YStack, Text } from 'tamagui';
import { colors } from '@/theme/colors';

interface AlertModalProps {
  visible: boolean;
  message: string;
  duration?: number; // Duration in milliseconds, 0 or undefined means no auto-dismiss
  onComplete?: () => void;
  type: 'success' | 'info' | 'warning' | 'error';
}

export function AlertModal({
  visible,
  message,
  duration = 3000, // Default 3 seconds
  onComplete,
  type,
}: AlertModalProps) {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  useEffect(() => {
    if (!isVisible || !duration || duration <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [isVisible, duration, onComplete]);

  const getTypeColor = useCallback(() => {
    switch (type) {
      case 'success':
        return '#22c55e';
      case 'warning':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      case 'info':
      default:
        return colors.niceOrange;
    }
  }, [type]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={handleDismiss}>
      <Pressable
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        }}
        onPress={handleDismiss}
      >
        <YStack
          width="90%"
          maxWidth={420}
          backgroundColor={colors.midGray}
          borderRadius="$4"
          padding="$4"
          space="$3"
          borderLeftWidth={4}
          borderLeftColor={getTypeColor()}
        >
          <Text color={colors.white} fontSize="$5" fontWeight="600" textAlign="center">
            {message}
          </Text>
        </YStack>
      </Pressable>
    </Modal>
  );
}
