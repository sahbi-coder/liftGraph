import React from 'react';
import { Stack } from 'expo-router';

import { colors } from '@/theme/colors';
import { DrawerButton } from '@/components/DrawerButton';
import { useTranslation } from '@/hooks/common/useTranslation';
import { BackButton } from '@/components/BackButton';

export default function WorkoutLayout() {
  const { t } = useTranslation();
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
          headerTitle: t('workout.title'),
          headerTitleAlign: 'left',
          headerTitleStyle: { fontSize: 28 },
          headerLeft: () => <DrawerButton />,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: t('workout.create'),
          headerTitleStyle: { fontSize: 22 },
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="exercises"
        options={{
          title: t('workout.exercises'),
          headerTitleStyle: { fontSize: 22 },
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: t('workout.edit'),
          headerTitleStyle: { fontSize: 22 },
          headerLeft: () => <BackButton />,
        }}
      />
    </Stack>
  );
}
