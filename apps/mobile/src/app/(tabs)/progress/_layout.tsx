import React from 'react';
import { Stack } from 'expo-router';

import { colors } from '@/theme/colors';

export default function ProgressLayout() {
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
          headerShown: true,
          headerTitle: 'LiftGraph',
          headerTitleAlign: 'center',
          headerTitleStyle: { fontSize: 35 },
        }}
      />
      <Stack.Screen
        name="estimated-1rm"
        options={{ headerTitle: 'Estimated 1RM Trend', headerTitleAlign: 'center' }}
      />
      <Stack.Screen
        name="top-set"
        options={{ headerTitle: 'Top Set Progression Chart', headerTitleAlign: 'center' }}
      />
      <Stack.Screen
        name="weekly-volume"
        options={{ headerTitle: 'Weekly Volume Load', headerTitleAlign: 'center' }}
      />
      <Stack.Screen
        name="frequency-chart"
        options={{ headerTitle: 'Workout Frequency', headerTitleAlign: 'center' }}
      />
    </Stack>
  );
}
