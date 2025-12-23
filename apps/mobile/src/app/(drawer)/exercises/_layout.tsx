import { Stack } from 'expo-router';
import React from 'react';
import { BackButton } from '@/components/BackButton';
import { colors } from '@/theme/colors';
import { useTranslation } from '@/hooks/common/useTranslation';
import { Platform } from 'react-native';

export default function ExercisesLayout() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'left',
        headerTitleStyle: { fontSize: 28, color: colors.white },
        headerStyle: { backgroundColor: colors.darkerGray },
        headerTintColor: colors.white,
        headerBackVisible: Platform.OS === 'android',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: t('exercises.title'),
          headerLeft: () => (Platform.OS === 'ios' ? <BackButton /> : null),
        }}
      />
      <Stack.Screen
        name="exercise-create"
        options={{
          headerTitle: t('exercise.create'),
          headerLeft: () => (Platform.OS === 'ios' ? <BackButton /> : null),
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: t('exercise.edit'),
          headerLeft: () => (Platform.OS === 'ios' ? <BackButton /> : null),
        }}
      />
    </Stack>
  );
}
