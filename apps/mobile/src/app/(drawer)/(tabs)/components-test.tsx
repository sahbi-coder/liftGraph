import React from 'react';
import { YStack, Text } from 'tamagui';
import { DaySelector } from '@/components/DaySelector';
import type { ProgramDayLabel } from '@/services';
import { LoadingView, ErrorView } from '@/components/StatusViews';
import { useTranslation } from '@/hooks/useTranslation';

export default function ComponentsTestScreen() {
  const handleSelectionChange = (selectedDays: ProgramDayLabel[]) => {
    console.log('Selected days:', selectedDays);
  };
  const { i18n } = useTranslation();
  console.log('Locale:', i18n.language);

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
