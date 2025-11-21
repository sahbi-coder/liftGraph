import React from 'react';
import { YStack, Text } from 'tamagui';
import { DaySelector, type ProgramDay } from '@/components/DaySelector';
import { LoadingView, ErrorView } from '@/components/StatusViews';

export default function ComponentsTestScreen() {
  const handleSelectionChange = (selectedDays: ProgramDay[]) => {
    console.log('Selected days:', selectedDays);
  };

  return (
    <YStack flex={1} backgroundColor="$background" padding="$4" space="$4">
      <Text color="$textPrimary" fontSize="$6" fontWeight="600">
        Components Test
      </Text>

      <DaySelector onSelectionChange={handleSelectionChange} />

      <Text color="$textPrimary" fontSize="$5" fontWeight="600">
        LoadingView
      </Text>
      <YStack height={160} borderRadius="$4" overflow="hidden">
        <LoadingView />
      </YStack>

      <Text color="$textPrimary" fontSize="$5" fontWeight="600">
        ErrorView
      </Text>
      <YStack height={220} borderRadius="$4" overflow="hidden">
        <ErrorView onRetry={() => console.log('Retry pressed from ErrorView preview')} />
      </YStack>
    </YStack>
  );
}
