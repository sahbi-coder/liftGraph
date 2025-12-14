import React from 'react';
import { ScrollView, TouchableOpacity, Switch } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Target, Languages, Shield, Download, Star, Info } from '@tamagui/lucide-icons';

import { colors } from '@/theme/colors';
import { useAuthenticatedUser } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';

export default function SettingsScreen() {
  const { user } = useAuthenticatedUser();
  const router = useRouter();
  const { t } = useTranslation();

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  const accountSettings = [
    {
      id: 'units',
      label: t('settings.unitsAndMeasurements'),
      icon: Target,
      onPress: () => handleNavigation('/(drawer)/settings/units'),
    },
  ];

  const appSettings = [
    {
      id: 'language',
      label: t('settings.language'),
      icon: Languages,
      value: t('settings.english'),
      onPress: () => console.log('Language'),
    },
  ];

  const dataPrivacySettings = [
    {
      id: 'privacyPolicy',
      label: t('settings.privacyPolicy'),
      icon: Shield,
      onPress: () => console.log('Privacy Policy'),
    },
    {
      id: 'exportData',
      label: t('settings.exportData'),
      icon: Download,
      onPress: () => handleNavigation('/(drawer)/export-data'),
    },
  ];

  const supportSettings = [
    {
      id: 'rateUs',
      label: t('settings.rateUs'),
      icon: Star,
      onPress: () => handleNavigation('/(drawer)/rate-us'),
    },
    {
      id: 'ContactUs',
      label: t('settings.contactUs'),
      icon: Info,
      value: t('settings.version'),
      onPress: () => handleNavigation('/(drawer)/contact-us'),
    },
  ];

  const renderSettingItem = (
    item: {
      id: string;
      label: string;
      icon: any;
      value?: string;
      onPress: () => void;
    },
    showToggle?: boolean,
    toggleValue?: boolean,
    onToggleChange?: (value: boolean) => void,
  ) => {
    const IconComponent = item.icon;
    return (
      <TouchableOpacity onPress={item.onPress} activeOpacity={0.7}>
        <XStack
          backgroundColor={colors.darkGray}
          borderRadius="$3"
          padding="$4"
          space="$3"
          alignItems="center"
          marginBottom="$2"
        >
          <IconComponent size={24} color={colors.niceOrange} />
          <Text color={colors.white} fontSize="$5" fontWeight="500" flex={1}>
            {item.label}
          </Text>
          {showToggle && onToggleChange !== undefined ? (
            <Switch
              value={toggleValue}
              onValueChange={onToggleChange}
              trackColor={{ false: colors.midGray, true: colors.niceOrange }}
              thumbColor={colors.white}
            />
          ) : item.value ? (
            <XStack space="$2" alignItems="center">
              <Text color={colors.midGray} fontSize="$4">
                {item.value}
              </Text>
              <Feather name="chevron-right" size={20} color={colors.midGray} />
            </XStack>
          ) : (
            <Feather name="chevron-right" size={20} color={colors.midGray} />
          )}
        </XStack>
      </TouchableOpacity>
    );
  };

  return (
    <YStack flex={1} backgroundColor={colors.darkerGray}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <YStack padding="$4" paddingTop="$10" space="$6">
          {/* User Profile Section */}
          <XStack
            backgroundColor={colors.darkGray}
            borderRadius="$3"
            padding="$4"
            space="$3"
            alignItems="center"
          >
            <YStack flex={1} space="$1">
              <Text color={colors.white} fontSize="$6" fontWeight="bold">
                {user.displayName}
              </Text>
              <Text color={colors.midGray} fontSize="$4">
                {user.email}
              </Text>
            </YStack>
          </XStack>

          {/* Account Section */}
          <YStack space="$3">
            <Text color={colors.midGray} fontSize="$5" fontWeight="600" textTransform="uppercase">
              {t('settings.account')}
            </Text>
            <YStack>
              {accountSettings.map((item) => (
                <React.Fragment key={item.id}>{renderSettingItem(item)}</React.Fragment>
              ))}
            </YStack>
          </YStack>

          {/* App Settings Section */}
          <YStack space="$3">
            <Text color={colors.midGray} fontSize="$5" fontWeight="600" textTransform="uppercase">
              {t('settings.appSettings')}
            </Text>
            <YStack>
              {appSettings.map((item) => (
                <React.Fragment key={item.id}>{renderSettingItem(item)}</React.Fragment>
              ))}
            </YStack>
          </YStack>

          {/* Data & Privacy Section */}
          <YStack space="$3">
            <Text color={colors.midGray} fontSize="$5" fontWeight="600" textTransform="uppercase">
              {t('settings.dataPrivacy')}
            </Text>
            <YStack>
              {dataPrivacySettings.map((item) => (
                <React.Fragment key={item.id}>{renderSettingItem(item)}</React.Fragment>
              ))}
            </YStack>
          </YStack>

          {/* Support Section */}
          <YStack space="$3">
            <Text color={colors.midGray} fontSize="$5" fontWeight="600" textTransform="uppercase">
              {t('settings.support')}
            </Text>
            <YStack>
              {supportSettings.map((item) => (
                <React.Fragment key={item.id}>{renderSettingItem(item)}</React.Fragment>
              ))}
            </YStack>
          </YStack>

          {/* Footer */}
          <YStack alignItems="center" space="$1" marginTop="$4">
            <Text color={colors.midGray} fontSize="$4">
              {t('common.appName')}
            </Text>
            <Text color={colors.midGray} fontSize="$3">
              {t('settings.version')}
            </Text>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
