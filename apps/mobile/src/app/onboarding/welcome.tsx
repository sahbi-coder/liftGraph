import React from 'react';
import { YStack, XStack, Text, Button, H1 } from 'tamagui';
import { useRouter } from 'expo-router';
import { Image } from 'react-native';
import { colors } from '@/theme/colors';

import { Download, Target, TrendingUp } from '@tamagui/lucide-icons';

export default function WelcomeOnboardingScreen() {
  const router = useRouter();

  const logoSource = require('../../../assets/exp-icon.png');

  return (
    <YStack flex={1} padding="$4" paddingTop="$5">
      {/* Progress indicator - Step 1 of 2 */}
      <XStack justifyContent="flex-end" marginBottom="$6" marginTop="$4">
        <XStack space="$1" alignItems="center">
          <YStack width={8} height={8} borderRadius={4} backgroundColor={colors.niceOrange} />
          <YStack width={8} height={8} borderRadius={4} backgroundColor={colors.midGray} />
        </XStack>
      </XStack>

      {/* Logo/Icon */}
      <YStack alignItems="center" marginBottom="$3">
        <YStack
          width={100}
          height={100}
          borderRadius="$4"
          backgroundColor={colors.darkGray}
          justifyContent="center"
          alignItems="center"
          marginBottom="$4"
        >
          <Image
            source={logoSource}
            style={{ width: 80, height: 80, borderRadius: 8 }}
            resizeMode="contain"
          />
        </YStack>
        <H1 color={colors.white} fontSize="$10" fontWeight="bold" textAlign="center">
          Welcome to LiftGraph
        </H1>
        <Text color={colors.midGray} fontSize="$5" textAlign="center" marginTop="$2">
          Your personal powerlifting companion
        </Text>
      </YStack>

      {/* Features */}
      <YStack space="$4" flex={1}>
        <XStack
          space="$4"
          alignItems="center"
          backgroundColor={colors.darkGray}
          padding="$4"
          borderRadius="$4"
        >
          <YStack
            width={50}
            height={50}
            borderRadius="$3"
            backgroundColor={colors.niceOrange}
            justifyContent="center"
            alignItems="center"
            opacity={0.2}
          >
            <Target size={28} color={colors.niceOrange} />
          </YStack>
          <YStack flex={1}>
            <Text color={colors.white} fontSize="$5" fontWeight="600" marginBottom="$1">
              Plan Workouts
            </Text>
            <Text color={colors.midGray} fontSize="$4">
              Create and schedule your training sessions
            </Text>
          </YStack>
        </XStack>

        <XStack
          space="$4"
          alignItems="center"
          backgroundColor={colors.darkGray}
          padding="$4"
          borderRadius="$4"
        >
          <YStack
            width={50}
            height={50}
            borderRadius="$3"
            backgroundColor={colors.niceOrange}
            justifyContent="center"
            alignItems="center"
            opacity={0.2}
          >
            <TrendingUp size={28} color={colors.niceOrange} />
          </YStack>
          <YStack flex={1}>
            <Text color={colors.white} fontSize="$5" fontWeight="600" marginBottom="$1">
              Track Progress
            </Text>
            <Text color={colors.midGray} fontSize="$4">
              Monitor your strength gains and PRs
            </Text>
          </YStack>
        </XStack>

        <XStack
          space="$4"
          alignItems="center"
          backgroundColor={colors.darkGray}
          padding="$4"
          borderRadius="$4"
        >
          <YStack
            width={50}
            height={50}
            borderRadius="$3"
            backgroundColor={colors.niceOrange}
            justifyContent="center"
            alignItems="center"
            opacity={0.2}
          >
            <Download size={28} color={colors.niceOrange} />
          </YStack>
          <YStack flex={1}>
            <Text color={colors.white} fontSize="$5" fontWeight="600" marginBottom="$1">
              Export Your Data
            </Text>
            <Text color={colors.midGray} fontSize="$4">
              Download your workout history anytime
            </Text>
          </YStack>
        </XStack>
      </YStack>

      {/* Action Buttons */}
      <YStack space="$3" marginBottom="$6">
        <Button
          size="$5"
          backgroundColor={colors.niceOrange}
          color={colors.white}
          fontWeight="600"
          borderRadius="$4"
          onPress={() => router.push('/onboarding/units')}
          pressStyle={{ opacity: 0.85 }}
        >
          Get Started
        </Button>
      </YStack>
    </YStack>
  );
}
