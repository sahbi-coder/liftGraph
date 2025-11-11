import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { YStack, Text, Button } from 'tamagui';

import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);

    try {
      await signOut();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign out.';
      Alert.alert('Sign out failed', message);
      setIsSigningOut(false);
    }
  }, [signOut]);

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor="$background"
      padding="$4"
      space="$4"
    >
      <Text color="$textPrimary" fontSize="$6" fontWeight="600">
        Welcome{user?.displayName ? `, ${user.displayName}` : ''}!
      </Text>
      <Text color="$textSecondary">
        {user?.email ? `Signed in as ${user.email}` : 'You are signed in.'}
      </Text>
      <Button
        size="$4"
        backgroundColor="$backgroundStrong"
        color="$textPrimary"
        onPress={handleSignOut}
        disabled={isSigningOut}
        opacity={isSigningOut ? 0.6 : 1}
      >
        {isSigningOut ? 'Signing out...' : 'Log out'}
      </Button>
    </YStack>
  );
}
