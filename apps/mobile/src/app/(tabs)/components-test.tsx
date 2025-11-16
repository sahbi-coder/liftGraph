import React from 'react';
import { YStack, Text } from 'tamagui';
import { DaySelector, type ProgramDay } from '@/components/DaySelector';

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
    </YStack>
  );
}
