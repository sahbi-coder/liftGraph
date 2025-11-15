import React from 'react';
import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { YStack, Text, Button } from 'tamagui';

import { colors } from '@/theme/colors';

export default function ProgramScreen() {
  const router = useRouter();

  const handleCreateProgram = () => {
    router.push('/(tabs)/program/create');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.darkerGray }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
    >
      <YStack space="$2" alignItems="flex-start">
        <Text color="$textPrimary" fontSize="$9" fontWeight="700">
          Programs
        </Text>
        <Text color="$textSecondary" fontSize="$5">
          Manage your training programs
        </Text>
      </YStack>

      <Button
        size="$5"
        backgroundColor="$secondaryButton"
        color="$secondaryButtonText"
        fontWeight="600"
        borderRadius="$4"
        onPress={handleCreateProgram}
        pressStyle={{ opacity: 0.85 }}
        alignSelf="stretch"
      >
        Create Program
      </Button>
    </ScrollView>
  );
}
