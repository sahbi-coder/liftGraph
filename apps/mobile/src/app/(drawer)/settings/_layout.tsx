import { Stack } from 'expo-router';
import React from 'react';
import { BackButton } from '@/components/BackButton';
import { colors } from '@/theme/colors';
import { Platform } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';

export default function SettingsLayout() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'left',
        headerTitleStyle: { fontSize: 28, color: colors.white },
        headerStyle: { backgroundColor: colors.darkerGray },
        headerTintColor: colors.white,
        headerBackVisible: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: t('settings.title'),
          headerLeft: () => (Platform.OS === 'ios' ? <BackButton /> : null),
        }}
      />
      <Stack.Screen
        name="units"
        options={{
          headerTitle: t('settings.unitsAndMeasurements'),
        }}
      />
    </Stack>
  );
}
