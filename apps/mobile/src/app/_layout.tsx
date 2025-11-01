import 'react-native-reanimated';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { PropsWithChildren, useEffect } from 'react';
import { Text } from 'react-native';
import { TamaguiProvider } from 'tamagui';
import { tamaguiConfig } from 'tamagui.config';

import { useThemeFonts } from '@/theme/fonts';

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
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
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
    <Theme>
      <Screen />
    </Theme>
  );
}

export default RootLayout;
