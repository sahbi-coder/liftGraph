import React from 'react';
import { ActivityIndicator } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import { AlertTriangle } from '@tamagui/lucide-icons';

import { colors } from '@/theme/colors';
import { useTranslation } from '@/hooks/common/useTranslation';

export const LoadingView = () => {
  return (
    <YStack
      flex={1}
      backgroundColor={colors.darkerGray}
      alignItems="center"
      justifyContent="center"
      padding="$4"
      gap="$3"
    >
      <ActivityIndicator size="large" color={colors.niceOrange} />
    </YStack>
  );
};

type ErrorViewProps = {
  onRetry: () => void;
};

export const ErrorView: React.FC<ErrorViewProps> = ({ onRetry }) => {
  const { t } = useTranslation();

  return (
    <YStack
      flex={1}
      backgroundColor={colors.darkerGray}
      alignItems="center"
      justifyContent="center"
      padding="$4"
      gap="$3"
    >
      <XStack
        width={72}
        height={72}
        borderRadius="$4"
        backgroundColor={`${colors.niceOrange}20`}
        alignItems="center"
        justifyContent="center"
      >
        <AlertTriangle size={40} color={colors.niceOrange} />
      </XStack>

      <Text color={colors.white} fontSize="$6" fontWeight="700">
        {t('common.oopsSomethingWentWrong')}
      </Text>

      <Button
        backgroundColor={colors.niceOrange}
        color={colors.white}
        paddingHorizontal="$4"
        paddingVertical="$2"
        borderRadius="$3"
        onPress={onRetry}
      >
        {t('common.tryAgain')}
      </Button>
    </YStack>
  );
};
