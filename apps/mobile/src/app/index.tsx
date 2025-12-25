import React from 'react';
import { YStack, Text } from 'tamagui';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useTranslation } from '@/hooks/common/useTranslation';

export default function IndexRoute() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { preferences, loading: prefsLoading } = useUserPreferences();

  if (authLoading || prefsLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Text color="$textPrimary">{t('common.loading')}</Text>
      </YStack>
    );
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  // Check if onboarding is completed
  if (!preferences?.onboardingCompleted) {
    return <Redirect href="/onboarding/welcome" />;
  }

  return <Redirect href="/(drawer)/(tabs)/workout" />;
}
