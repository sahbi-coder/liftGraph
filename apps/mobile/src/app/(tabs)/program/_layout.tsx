import React from 'react';
import { Stack } from 'expo-router';

import { colors } from '@/theme/colors';

export default function ProgramLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.darkerGray },
        headerTintColor: colors.white,
        headerTitleStyle: { color: colors.white },
        contentStyle: { backgroundColor: colors.darkerGray },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Programs' }} />
      <Stack.Screen name="create" options={{ title: 'Create Program' }} />
      <Stack.Screen name="exercises" options={{ title: 'Select Exercise' }} />
      <Stack.Screen name="[id]" options={{ title: 'Program Details' }} />
    </Stack>
  );
}
