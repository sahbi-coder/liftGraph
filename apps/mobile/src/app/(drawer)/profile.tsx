import React, { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import { Calendar, LogOut } from '@tamagui/lucide-icons';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';

import { colors } from '@/theme/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { getAuthErrorMessage } from '@/utils/authErrors';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      getAuthErrorMessage(error, t);
    }
  };

  // Format member since date using dayjs with locale support
  const memberSinceDate = useMemo(() => {
    if (!user?.createdAt) return '-';

    // Get dayjs locale based on current i18n language
    const currentLang = i18n.language || 'en';
    const dayjsLocale = currentLang === 'es' ? 'es' : currentLang === 'fr' ? 'fr' : 'en';

    // Use localized dayjs instance without changing global locale
    return dayjs(user.createdAt).locale(dayjsLocale).format('MMM YYYY');
  }, [user?.createdAt, i18n.language]);

  // Get subscription plan type - TODO: Get actual subscription plan from user profile
  const subscriptionPlanType = 'free'; // This should come from user profile
  const subscriptionPlan = t(`profile.planType.${subscriptionPlanType}`);

  return (
    <YStack flex={1} backgroundColor={colors.darkerGray}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <YStack padding="$4" paddingTop="$10" space="$6">
          {/* Email */}
          <YStack space="$2">
            <Text color={colors.white} fontSize="$5" fontWeight="600">
              {t('profile.email')}
            </Text>
            <YStack backgroundColor={colors.darkGray} borderRadius="$3" padding="$4">
              <Text color={colors.white} fontSize="$5">
                {user?.email || '-'}
              </Text>
            </YStack>
          </YStack>

          {/* Member Since */}
          <YStack space="$2">
            <Text color={colors.white} fontSize="$5" fontWeight="600">
              {t('profile.memberSince')}
            </Text>
            <YStack backgroundColor={colors.darkGray} borderRadius="$3" padding="$4">
              <XStack space="$2" alignItems="center">
                <Calendar size={18} color={colors.niceOrange} />
                <Text color={colors.white} fontSize="$5">
                  {memberSinceDate}
                </Text>
              </XStack>
            </YStack>
          </YStack>

          {/* Subscription Plan */}
          <YStack space="$2">
            <Text color={colors.white} fontSize="$5" fontWeight="600">
              {t('profile.subscriptionPlan')}
            </Text>
            <YStack backgroundColor={colors.darkGray} borderRadius="$3" padding="$4">
              <Text color={colors.white} fontSize="$5">
                {subscriptionPlan}
              </Text>
            </YStack>
          </YStack>

          {/* Logout Button */}
          <Button
            width="100%"
            backgroundColor={colors.niceOrange}
            onPress={handleLogout}
            borderRadius="$3"
            marginTop="$2"
          >
            <XStack space="$2" alignItems="center">
              <LogOut size={20} color={colors.white} />
              <Text fontWeight="600" color={colors.white}>
                {t('profile.logout')}
              </Text>
            </XStack>
          </Button>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
