import React from 'react';
import { Stack } from 'expo-router';

import { BackButton } from '@/components/BackButton';

import { colors } from '@/theme/colors';
import { DrawerButton } from '@/components/DrawerButton';
import { useTranslation } from '@/hooks/useTranslation';

export default function ProgressLayout() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.darkerGray },
        headerTintColor: colors.white,
        headerTitleStyle: { color: colors.white },
        contentStyle: { backgroundColor: colors.darkerGray },
        headerBackVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: t('progress.progressAnalytics'),
          headerTitleAlign: 'left',
          headerTitleStyle: { fontSize: 28 },
          headerLeft: () => <DrawerButton />,
        }}
      />
      <Stack.Screen
        name="estimated-1rm"
        options={{
          headerTitle: t('progress.estimated1RMTrend'),
          headerTitleAlign: 'center',
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="top-set"
        options={{
          headerTitle: t('progress.topSetProgressionChart'),
          headerTitleAlign: 'center',
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="weekly-volume"
        options={{
          headerTitle: t('progress.weeklyVolumeLoad'),
          headerTitleAlign: 'center',
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="frequency-chart"
        options={{
          headerTitle: t('progress.workoutFrequency'),
          headerTitleAlign: 'center',
          headerLeft: () => <BackButton />,
        }}
      />
    </Stack>
  );
}
