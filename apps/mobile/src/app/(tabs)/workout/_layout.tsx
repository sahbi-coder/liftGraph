import React from 'react';
import { Stack } from 'expo-router';

import { colors } from '@/theme/colors';

export default function WorkoutLayout() {
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
          headerTitle: 'Workouts',
          headerTitleAlign: 'left',
          headerTitleStyle: { fontSize: 28 },
        }}
      />
      <Stack.Screen name="create" options={{ title: 'Create Workout' }} />
      <Stack.Screen name="exercises" options={{ title: 'Select Exercise' }} />
      <Stack.Screen name="edit" options={{ title: 'Edit Workout' }} />
    </Stack>
  );
}
