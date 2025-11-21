import 'react-native-reanimated';
import 'react-native-get-random-values';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { PropsWithChildren, useEffect } from 'react';
import { Text } from 'react-native';
import { TamaguiProvider } from 'tamagui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { tamaguiConfig } from 'tamagui.config';

import { createClients } from '@/clients/createClients';
import { DependenciesProvider } from '@/dependencies/provider';
import { createDependencies } from '@/dependencies/createDependencies';
import { createConfig } from '@/config';
import { useThemeFonts } from '@/theme/fonts';
import { AuthProvider } from '@/contexts/AuthContext';

const config = createConfig({
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  },
});

const clients = createClients(config);
const dependencies = createDependencies(clients);
const queryClient = new QueryClient();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(console.error);

function Theme({ children }: PropsWithChildren) {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <ThemeProvider value={DefaultTheme}>{children}</ThemeProvider>
    </TamaguiProvider>
  );
}

function Screen() {
  return (
    <Stack
      screenOptions={{
        headerTitle: '',
        headerShadowVisible: false,
        headerShown: false,
      }}
    />
  );
}

function RootLayout() {
  const [loaded] = useThemeFonts();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(console.error);
    }
  }, [loaded]);

  if (!loaded) {
    return <Text>Loading...</Text>;
  }

  return (
    <DependenciesProvider dependencies={dependencies}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Theme>
            <Screen />
          </Theme>
        </AuthProvider>
      </QueryClientProvider>
    </DependenciesProvider>
  );
}

export default RootLayout;
