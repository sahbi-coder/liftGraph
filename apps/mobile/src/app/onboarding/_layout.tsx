import { Stack } from 'expo-router';
import React from 'react';
import { colors } from '@/theme/colors';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.darkerGray },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="units" />
    </Stack>
  );
}
