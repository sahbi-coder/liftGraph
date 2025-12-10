import { Stack } from 'expo-router';
import React from 'react';
import { BackButton } from '@/components/BackButton';
import { colors } from '@/theme/colors';
import { Platform } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';

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
        headerBackVisible: true,
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
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: t('exercise.edit'),
        }}
      />
    </Stack>
  );
}

