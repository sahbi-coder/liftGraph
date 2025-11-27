import React from 'react';
import { YStack, Text, Button } from 'tamagui';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <YStack flex={1} backgroundColor={colors.darkerGray} padding="$4" paddingTop="$10">
      <YStack space="$4">
        <YStack space="$2">
          <Text color={colors.midGray} fontSize="$4" fontWeight="600">
            Email
          </Text>
          <Text color={colors.white} fontSize="$5">
            {user?.email || 'Not available'}
          </Text>
        </YStack>

        <YStack marginTop="$6" paddingTop="$4" borderTopWidth={1} borderTopColor={colors.midGray}>
          <Button
            size="$4"
            backgroundColor={colors.midGray}
            color={colors.white}
            fontWeight="600"
            borderRadius="$4"
            onPress={handleLogout}
            pressStyle={{ opacity: 0.85 }}
          >
            Logout
          </Button>
        </YStack>
      </YStack>
    </YStack>
  );
}
