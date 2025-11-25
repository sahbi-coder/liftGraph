import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { YStack, Text, Button } from 'tamagui';

import { colors } from '@/theme/colors';
import { ProgramHomeScreen } from '@/components/program/ProgramHomeScreen';
import { useUserPrograms } from '@/hooks/useUserPrograms';

export default function ProgramHome() {
  const router = useRouter();

  const { programs, isLoading, isError, refetch } = useUserPrograms();

  const handleCreateProgram = useCallback(() => {
    router.push('/(tabs)/program/create');
  }, [router]);

  const handleProgramPress = useCallback(
    (programId: string) => {
      router.push({
        pathname: '/(tabs)/program/[id]',
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
          Loading programs...
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
          Failed to load programs
        </Text>
        <Button backgroundColor="$primaryButton" color={colors.white} onPress={() => refetch()}>
          Retry
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
