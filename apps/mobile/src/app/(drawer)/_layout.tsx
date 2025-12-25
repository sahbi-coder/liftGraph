import React from 'react';
import { Drawer } from 'react-native-drawer-layout';
import { Stack, Redirect } from 'expo-router';
import { YStack, Text } from 'tamagui';
import { Platform } from 'react-native';
import { BackButton } from '@/components/BackButton';

import { useAuth } from '@/contexts/AuthContext';
import { DrawerContent } from '@/components/DrawerContent';
import { DrawerProvider, useDrawer } from '@/contexts/DrawerContext';
import { colors } from '@/theme/colors';
import { useTranslation } from '@/hooks/common/useTranslation';

function DrawerContentWrapper() {
  const { closeDrawer } = useDrawer();
  return <DrawerContent onClose={closeDrawer} />;
}

function DrawerInner() {
  const { user, loading } = useAuth();
  const { open, setOpen } = useDrawer();
  const { t } = useTranslation();
  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Text color="$textPrimary">{t('common.loading')}</Text>
      </YStack>
    );
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Drawer
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      renderDrawerContent={DrawerContentWrapper}
      drawerType="front"
      drawerStyle={{ width: 280 }}
    >
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="profile"
          options={{
            headerShown: true,
            headerTitle: t('profile.title'),
            headerTitleAlign: 'left',
            headerTitleStyle: { fontSize: 28, color: colors.white },
            headerStyle: { backgroundColor: colors.darkerGray },
            headerTintColor: colors.white,
            headerLeft: () => (Platform.OS === 'ios' ? <BackButton /> : null),
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="export-data"
          options={{
            headerShown: true,
            headerTitle: t('exportData.title'),
            headerTitleAlign: 'left',
            headerTitleStyle: { fontSize: 28, color: colors.white },
            headerStyle: { backgroundColor: colors.darkerGray },
            headerTintColor: colors.white,
            headerLeft: () => (Platform.OS === 'ios' ? <BackButton /> : null),
          }}
        />
        <Stack.Screen
          name="rate-us"
          options={{
            headerShown: true,
            headerTitle: t('rateUs.title'),
            headerTitleAlign: 'left',
            headerTitleStyle: { fontSize: 28, color: colors.white },
            headerStyle: { backgroundColor: colors.darkerGray },
            headerTintColor: colors.white,
            headerLeft: () => (Platform.OS === 'ios' ? <BackButton /> : null),
          }}
        />
        <Stack.Screen
          name="contact-us"
          options={{
            headerShown: true,
            headerTitle: t('contactUs.title'),
            headerTitleAlign: 'left',
            headerTitleStyle: { fontSize: 28, color: colors.white },
            headerStyle: { backgroundColor: colors.darkerGray },
            headerTintColor: colors.white,
            headerLeft: () => (Platform.OS === 'ios' ? <BackButton /> : null),
          }}
        />
        <Stack.Screen
          name="exercises"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </Drawer>
  );
}

export default function DrawerLayout() {
  return (
    <DrawerProvider>
      <DrawerInner />
    </DrawerProvider>
  );
}
