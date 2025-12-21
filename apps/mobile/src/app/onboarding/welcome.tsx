import React from 'react';
import { YStack, XStack, Text, Button, H1 } from 'tamagui';
import { useRouter } from 'expo-router';
import { Image, ScrollView } from 'react-native';
import { colors } from '@/theme/colors';
import { useTranslation } from '@/hooks/common/useTranslation';

import { Download, Target, TrendingUp } from '@tamagui/lucide-icons';

export default function WelcomeOnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const logoSource = require('../../../assets/exp-icon.png');

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
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
            justifyContent="center"
            alignItems="center"
            marginBottom="$4"
          >
            <Image
              source={logoSource}
              style={{ width: 100, height: 100, borderRadius: 8 }}
              resizeMode="contain"
            />
          </YStack>
          <H1 color={colors.white} fontSize="$10" fontWeight="bold" textAlign="center">
            {t('onboarding.welcomeToLiftGraph')}
          </H1>
          <Text color={colors.midGray} fontSize="$5" textAlign="center" marginVertical="$3.5">
            {t('onboarding.personalPowerliftingCompanion')}
          </Text>
        </YStack>

        {/* Features */}
        <YStack space="$4" flex={1}>
          <XStack
            space="$4"
            alignItems="center"
            backgroundColor={colors.darkGray}
            padding="$2.5"
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
                {t('onboarding.planWorkouts')}
              </Text>
              <Text color={colors.midGray} fontSize="$4">
                {t('onboarding.planWorkoutsDescription')}
              </Text>
            </YStack>
          </XStack>

          <XStack
            space="$4"
            alignItems="center"
            backgroundColor={colors.darkGray}
            padding="$2.5"
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
                {t('onboarding.trackProgress')}
              </Text>
              <Text color={colors.midGray} fontSize="$4">
                {t('onboarding.trackProgressDescription')}
              </Text>
            </YStack>
          </XStack>

          <XStack
            space="$4"
            alignItems="center"
            backgroundColor={colors.darkGray}
            padding="$2.5"
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
                {t('onboarding.exportYourData')}
              </Text>
              <Text color={colors.midGray} fontSize="$4">
                {t('onboarding.exportYourDataDescription')}
              </Text>
            </YStack>
          </XStack>
          <YStack space="$3">
            <Button
              size="$5"
              backgroundColor={colors.niceOrange}
              color={colors.white}
              fontWeight="600"
              borderRadius="$4"
              onPress={() => router.push('/onboarding/units')}
              pressStyle={{ opacity: 0.85 }}
            >
              {t('onboarding.getStarted')}
            </Button>
          </YStack>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
