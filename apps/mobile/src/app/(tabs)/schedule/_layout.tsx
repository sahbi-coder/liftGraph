import React from 'react';
import { Stack } from 'expo-router';

import { colors } from '@/theme/colors';

export default function ScheduleLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.darkerGray },
        headerTintColor: colors.white,
        headerTitleStyle: { color: colors.white },
        contentStyle: { backgroundColor: colors.darkerGray },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: 'LiftGraph',
          headerTitleAlign: 'center',
          headerTitleStyle: { fontSize: 35 },
        }}
      />
      <Stack.Screen name="edit" options={{ title: 'Edit Workout' }} />
    </Stack>
  );
}
