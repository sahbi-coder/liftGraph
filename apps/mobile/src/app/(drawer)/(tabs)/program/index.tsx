import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { YStack, Text, Button } from 'tamagui';

import { colors } from '@/theme/colors';
import { ProgramHomeScreen } from '@/components/program/ProgramHomeScreen';
import { useUserPrograms } from '@/hooks/useUserPrograms';
import { useTranslation } from '@/hooks/useTranslation';

export default function ProgramHome() {
  const router = useRouter();
  const { t } = useTranslation();

  const { programs, isLoading, isError, refetch } = useUserPrograms();

  const handleCreateProgram = useCallback(() => {
    router.push('/(drawer)/(tabs)/program/create');
  }, [router]);

  const handleProgramPress = useCallback(
    (programId: string) => {
      router.push({
        pathname: '/(drawer)/(tabs)/program/[id]',
        params: { id: programId },
      });
    },
    [router],
  );

  // Show loading state
  if (isLoading) {
    return (
      <YStack
        flex={1}
        backgroundColor={colors.darkerGray}
        justifyContent="center"
        alignItems="center"
        padding="$4"
      >
        <Text color="$textPrimary" fontSize="$5">
          {t('program.loadingPrograms')}
        </Text>
      </YStack>
    );
  }

  // Show error state
  if (isError) {
    return (
      <YStack
        flex={1}
        backgroundColor={colors.darkerGray}
        justifyContent="center"
        alignItems="center"
        padding="$4"
        space="$4"
      >
        <Text color="$textPrimary" fontSize="$5" textAlign="center">
          {t('program.failedToLoadPrograms')}
        </Text>
        <Button backgroundColor="$primaryButton" color={colors.white} onPress={() => refetch()}>
          {t('common.retry')}
        </Button>
      </YStack>
    );
  }

  return (
    <ProgramHomeScreen
      programs={programs ?? []}
      onCreateProgram={handleCreateProgram}
      onProgramPress={handleProgramPress}
    />
  );
}
