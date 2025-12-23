import React from 'react';
import { Stack } from 'expo-router';

import { colors } from '@/theme/colors';
import { DrawerButton } from '@/components/DrawerButton';
import { useTranslation } from '@/hooks/common/useTranslation';
import { BackButton } from '@/components/BackButton';

export default function ScheduleLayout() {
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
          headerTitle: t('schedule.title'),
          headerTitleAlign: 'left',
          headerTitleStyle: { fontSize: 28 },
          headerLeft: () => <DrawerButton />,
        }}
      />
      <Stack.Screen
        name="edit"
        options={{ title: t('workout.edit'), headerLeft: () => <BackButton /> }}
      />
      <Stack.Screen
        name="exercises"
        options={{ title: t('schedule.exercises'), headerLeft: () => <BackButton /> }}
      />
      <Stack.Screen
        name="exercise-create"
        options={{ title: t('exercise.create'), headerLeft: () => <BackButton /> }}
      />
    </Stack>
  );
}
