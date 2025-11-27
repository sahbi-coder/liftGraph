import React from 'react';
import { Stack } from 'expo-router';

import { colors } from '@/theme/colors';
import { DrawerButton } from '@/components/DrawerButton';

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
          headerTitle: 'Schedule',
          headerTitleAlign: 'left',
          headerTitleStyle: { fontSize: 28 },
          headerLeft: () => <DrawerButton />,
        }}
      />
      <Stack.Screen name="edit" options={{ title: 'Edit Workout' }} />
    </Stack>
  );
}
