import { Stack } from 'expo-router';
import React from 'react';
import { BackButton } from '@/components/BackButton';
import { colors } from '@/theme/colors';
import { Platform } from 'react-native';

export default function SettingsLayout() {
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
          headerTitle: 'Settings',
          headerLeft: () => (Platform.OS === 'ios' ? <BackButton /> : null),
        }}
      />
      <Stack.Screen
        name="units"
        options={{
          headerTitle: 'Units & Measurements',
        }}
      />
    </Stack>
  );
}
