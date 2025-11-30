import { Stack } from 'expo-router';
import React from 'react';
import { colors } from '@/theme/colors';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'left',
        headerTitleStyle: { fontSize: 28, color: colors.white },
        headerStyle: { backgroundColor: colors.darkerGray },
        headerTintColor: colors.white,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: 'Settings',
        }}
      />
      <Stack.Screen
        name="units"
        options={{
          headerTitle: 'Units & Measurements',
        }}
      />
    </Stack>
  );
}
