import React from 'react';
import { YStack, Text, H1, Button } from 'tamagui';
import { StatusBar } from 'expo-status-bar';

export default function IndexRoute() {
  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      padding="$4"
      justifyContent="center"
      alignItems="center"
    >
      <StatusBar style="auto" />
      <YStack space="$4" alignItems="center" maxWidth={600} width="100%">
        <H1 color="$textPrimary" fontSize="$10" fontWeight="bold">
          LiftGraph
        </H1>
        <Text color="$textSecondary" fontSize="$6" textAlign="center">
          Track your powerlifting progress
        </Text>
        <YStack space="$3" width="100%" marginTop="$6">
          <Button
            size="$5"
            backgroundColor="$primaryButton"
            color="$primaryButtonText"
            fontWeight="600"
            borderRadius="$4"
            pressStyle={{
              opacity: 0.8,
            }}
          >
            Get Started
          </Button>
        </YStack>
      </YStack>
    </YStack>
  );
}
