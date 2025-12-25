import React from 'react';
import { Stack } from 'expo-router';

import { colors } from '@/theme/colors';
import { DrawerButton } from '@/components/DrawerButton';
import { useTranslation } from '@/hooks/common/useTranslation';
import { BackButton } from '@/components/BackButton';
import { Platform } from 'react-native';

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
        options={{
          title: t('workout.edit'),
          headerTitleStyle: { fontSize: 22 },
          headerLeft: () => (Platform.OS === 'ios' ? <BackButton /> : null),
        }}
      />
      <Stack.Screen
        name="exercises"
        options={{
          title: t('schedule.exercises'),
          headerTitleStyle: { fontSize: 22 },
          headerLeft: () => (Platform.OS === 'ios' ? <BackButton /> : null),
        }}
      />
      <Stack.Screen
        name="exercise-create"
        options={{
          title: t('exercise.create'),
          headerTitleStyle: { fontSize: 22 },
          headerLeft: () => (Platform.OS === 'ios' ? <BackButton /> : null),
        }}
      />
    </Stack>
  );
}
