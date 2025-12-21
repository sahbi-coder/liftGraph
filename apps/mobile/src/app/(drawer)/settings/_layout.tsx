import { Stack } from 'expo-router';
import React from 'react';
import { BackButton } from '@/components/BackButton';
import { colors } from '@/theme/colors';
import { Platform } from 'react-native';
import { useTranslation } from '@/hooks/common/useTranslation';

export default function SettingsLayout() {
  const { t } = useTranslation();
  const titlePadding = Platform.OS === 'android' ? '    ' : '';
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'left',
        headerTitleStyle: { fontSize: 28, color: colors.white },
        headerStyle: { backgroundColor: colors.darkerGray },
        headerTintColor: colors.white,
        headerBackVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitleAlign: 'left',
          headerTitle: `${titlePadding}${t('settings.title')}`,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="language"
        options={{
          headerTitleAlign: 'left',
          headerLeft: () => <BackButton />,
          headerTitle: `${titlePadding}${t('settings.language')}`,
        }}
      />
      <Stack.Screen
        name="units"
        options={{
          headerTitleAlign: 'left',
          headerLeft: () => <BackButton />,
          headerTitle: `${titlePadding}${t('settings.unitsAndMeasurements')}`,
        }}
      />
    </Stack>
  );
}
