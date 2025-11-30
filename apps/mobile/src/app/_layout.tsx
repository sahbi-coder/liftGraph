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
import { useNetInfo } from '@react-native-community/netinfo';

import { createClients } from '@/clients/createClients';
import { DependenciesProvider } from '@/dependencies/provider';
import { createDependencies } from '@/dependencies/createDependencies';
import { createConfig } from '@/config';
import { useThemeFonts } from '@/theme/fonts';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext';
import { NoInternetScreen } from '@/components/NoInternetScreen';

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
  const { isInternetReachable } = useNetInfo();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(console.error);
    }
  }, [loaded]);

  if (!loaded) {
    return <Text>Loading...</Text>;
  }

  // Show no internet screen if we know there's no connection
  // (null/undefined means we're still checking, so show the app)
  if (!isInternetReachable) {
    return (
      <Theme>
        <NoInternetScreen />
      </Theme>
    );
  }

  return (
    <DependenciesProvider dependencies={dependencies}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UserPreferencesProvider>
            <Theme>
              <Screen />
            </Theme>
          </UserPreferencesProvider>
        </AuthProvider>
      </QueryClientProvider>
    </DependenciesProvider>
  );
}

export default RootLayout;
