import React from 'react';
import { Drawer } from 'react-native-drawer-layout';
import { Stack, Redirect, Slot, usePathname } from 'expo-router';
import { YStack, Text } from 'tamagui';
import { TouchableOpacity } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

import { useAuth } from '@/contexts/AuthContext';
import { DrawerContent } from '@/components/DrawerContent';
import { DrawerProvider, useDrawer } from '@/contexts/DrawerContext';
import { colors } from '@/theme/colors';

function DrawerContentWrapper() {
  const { closeDrawer } = useDrawer();
  return <DrawerContent onClose={closeDrawer} />;
}

function DrawerInner() {
  const { user, loading } = useAuth();
  const { open, setOpen } = useDrawer();
  const pathname = usePathname();

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Text color="$textPrimary">Loading...</Text>
      </YStack>
    );
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  // Don't show drawer on auth screens
  if (pathname?.startsWith('/auth')) {
    return <Slot />;
  }

  return (
    <Drawer
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      renderDrawerContent={DrawerContentWrapper}
      drawerType="slide"
    >
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.darkerGray },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            headerShown: true,
            headerTitle: 'Profile',
            headerTitleAlign: 'left',
            headerTitleStyle: { fontSize: 28, color: colors.white },
            headerStyle: { backgroundColor: colors.darkerGray },
            headerTintColor: colors.white,
            headerRight: () => (
              <TouchableOpacity
                onPress={() => {
                  // TODO: Navigate to edit profile
                  console.log('Edit profile');
                }}
                style={{ paddingRight: 16, paddingVertical: 8 }}
              >
                <Feather name="edit-2" size={24} color={colors.niceOrange} />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: true,
            headerTitle: 'Settings',
            headerTitleAlign: 'left',
            headerTitleStyle: { fontSize: 28, color: colors.white },
            headerStyle: { backgroundColor: colors.darkerGray },
            headerTintColor: colors.white,
          }}
        />
        <Stack.Screen
          name="export-data"
          options={{
            headerShown: true,
            headerTitle: 'Export Data',
            headerTitleAlign: 'left',
            headerTitleStyle: { fontSize: 28, color: colors.white },
            headerStyle: { backgroundColor: colors.darkerGray },
            headerTintColor: colors.white,
          }}
        />
        <Stack.Screen
          name="rate-us"
          options={{
            headerShown: true,
            headerTitle: 'Rate Us',
            headerTitleAlign: 'left',
            headerTitleStyle: { fontSize: 28, color: colors.white },
            headerStyle: { backgroundColor: colors.darkerGray },
            headerTintColor: colors.white,
          }}
        />
        <Stack.Screen
          name="contact-us"
          options={{
            headerShown: true,
            headerTitle: 'Contact Us',
            headerTitleAlign: 'left',
            headerTitleStyle: { fontSize: 28, color: colors.white },
            headerStyle: { backgroundColor: colors.darkerGray },
            headerTintColor: colors.white,
          }}
        />
        {/* Add more standalone screens here as Stack.Screen */}
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
