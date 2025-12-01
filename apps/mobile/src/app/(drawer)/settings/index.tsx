import React from 'react';
import { ScrollView, TouchableOpacity, Switch } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Target, Languages, Shield, Download, Star, Info } from '@tamagui/lucide-icons';

import { colors } from '@/theme/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  const accountSettings = [
    {
      id: 'units',
      label: 'Units & Measurements',
      icon: Target,
      onPress: () => handleNavigation('/(drawer)/settings/units'),
    },
  ];

  const appSettings = [
    {
      id: 'language',
      label: 'Language',
      icon: Languages,
      value: 'English',
      onPress: () => console.log('Language'),
    },
  ];

  const dataPrivacySettings = [
    {
      id: 'privacyPolicy',
      label: 'Privacy Policy',
      icon: Shield,
      onPress: () => console.log('Privacy Policy'),
    },
    {
      id: 'exportData',
      label: 'Export Data',
      icon: Download,
      onPress: () => handleNavigation('/(drawer)/export-data'),
    },
  ];

  const supportSettings = [
    {
      id: 'rateUs',
      label: 'Rate Us',
      icon: Star,
      onPress: () => handleNavigation('/(drawer)/rate-us'),
    },
    {
      id: 'ContactUs',
      label: 'Contact Us',
      icon: Info,
      value: 'v2.4.1',
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
                {user?.displayName || 'Marcus Johnson'}
              </Text>
              <Text color={colors.midGray} fontSize="$4">
                {user?.email || 'marcus.j@email.com'}
              </Text>
            </YStack>
          </XStack>

          {/* Account Section */}
          <YStack space="$3">
            <Text color={colors.midGray} fontSize="$5" fontWeight="600" textTransform="uppercase">
              Account
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
              App Settings
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
              Data & Privacy
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
              Support
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
              LiftGraph
            </Text>
            <Text color={colors.midGray} fontSize="$3">
              Version 2.4.1
            </Text>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
