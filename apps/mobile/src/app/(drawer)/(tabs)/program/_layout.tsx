import React from 'react';
import { Stack } from 'expo-router';

import { colors } from '@/theme/colors';
import { DrawerButton } from '@/components/DrawerButton';
import { useTranslation } from '@/hooks/common/useTranslation';

export default function ProgramLayout() {
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
          headerTitle: t('program.title'),
          headerTitleAlign: 'left',
          headerTitleStyle: { fontSize: 28 },
          headerLeft: () => <DrawerButton />,
        }}
      />
      <Stack.Screen name="create" options={{ title: t('program.create') }} />
      <Stack.Screen name="exercises" options={{ title: t('program.exercises') }} />
      <Stack.Screen name="[id]" options={{ title: t('program.title') }} />
      <Stack.Screen name="apply-workout" options={{ title: t('program.applyWorkout') }} />
    </Stack>
  );
}
