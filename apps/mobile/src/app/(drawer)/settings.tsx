import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Switch } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import {
  User,
  Dumbbell,
  Target,
  Bell,
  Moon,
  Languages,
  Shield,
  Download,
  Cloud,
  HelpCircle,
  Star,
  Info,
  LogOut,
} from '@tamagui/lucide-icons';

import { colors } from '@/theme/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile screen
    console.log('Edit profile');
  };

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  const accountSettings = [
    {
      id: 'personalInfo',
      label: 'Personal Information',
      icon: User,
      onPress: () => console.log('Personal Information'),
    },
    {
      id: 'trainingPreferences',
      label: 'Training Preferences',
      icon: Dumbbell,
      onPress: () => console.log('Training Preferences'),
    },
    {
      id: 'units',
      label: 'Units & Measurements',
      icon: Target,
      onPress: () => console.log('Units & Measurements'),
    },
  ];

  const appSettings = [
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      onPress: () => console.log('Notifications'),
    },
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
    {
      id: 'backupSync',
      label: 'Backup & Sync',
      icon: Cloud,
      onPress: () => console.log('Backup & Sync'),
    },
  ];

  const supportSettings = [
    {
      id: 'helpCenter',
      label: 'Help Center',
      icon: HelpCircle,
      onPress: () => console.log('Help Center'),
    },
    {
      id: 'rateUs',
      label: 'Rate Us',
      icon: Star,
      onPress: () => handleNavigation('/(drawer)/rate-us'),
    },
    {
      id: 'about',
      label: 'About',
      icon: Info,
      value: 'v2.4.1',
      onPress: () => console.log('About'),
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
            <YStack
              width={60}
              height={60}
              borderRadius={30}
              backgroundColor={colors.midGray}
              justifyContent="center"
              alignItems="center"
            >
              <Feather name="user" size={30} color={colors.midGray} />
            </YStack>
            <YStack flex={1} space="$1">
              <Text color={colors.white} fontSize="$6" fontWeight="bold">
                {user?.displayName || 'Marcus Johnson'}
              </Text>
              <Text color={colors.midGray} fontSize="$4">
                {user?.email || 'marcus.j@email.com'}
              </Text>
            </YStack>
            <TouchableOpacity onPress={handleEditProfile} activeOpacity={0.7}>
              <Feather name="edit-2" size={20} color={colors.niceOrange} />
            </TouchableOpacity>
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
              {/* Dark Mode with Toggle */}
              <TouchableOpacity activeOpacity={0.7}>
                <XStack
                  backgroundColor={colors.darkGray}
                  borderRadius="$3"
                  padding="$4"
                  space="$3"
                  alignItems="center"
                  marginBottom="$2"
                >
                  <Moon size={24} color={colors.niceOrange} />
                  <Text color={colors.white} fontSize="$5" fontWeight="500" flex={1}>
                    Dark Mode
                  </Text>
                  <Switch
                    value={darkMode}
                    onValueChange={setDarkMode}
                    trackColor={{ false: colors.midGray, true: colors.niceOrange }}
                    thumbColor={colors.white}
                  />
                </XStack>
              </TouchableOpacity>
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

          {/* Log Out Button */}
          <Button
            width="100%"
            backgroundColor="#ef4444"
            color={colors.white}
            onPress={handleLogout}
            borderRadius="$3"
            padding="$4"
            marginTop="$2"
          >
            <XStack space="$2" alignItems="center">
              <LogOut size={20} color={colors.white} />
              <Text fontSize="$5" fontWeight="600" color={colors.white}>
                Log Out
              </Text>
            </XStack>
          </Button>

          {/* Footer */}
          <YStack alignItems="center" space="$1" marginTop="$4">
            <Text color={colors.midGray} fontSize="$4">
              PowerLift Pro
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
