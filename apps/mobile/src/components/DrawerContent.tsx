import React from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import { useRouter, usePathname } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { useTranslation } from '@/hooks/useTranslation';

import { useDrawer } from '@/contexts/DrawerContext';
import { colors } from '@/theme/colors';

type DrawerContentProps = {
  onClose?: () => void;
};

export function DrawerContent({ onClose }: DrawerContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  const { closeDrawer } = useDrawer();

  const menuItems = [
    {
      label: t('profile.title'),
      icon: 'user' as const,
      route: '/(drawer)/profile',
      iconComponent: Feather,
    },
    {
      label: t('settings.title'),
      icon: 'settings' as const,
      route: '/(drawer)/settings',
      iconComponent: Feather,
    },
    {
      label: t('exercises.title'),
      icon: 'activity' as const,
      route: '/(drawer)/exercises',
      iconComponent: Feather,
    },
    {
      label: t('exportData.title'),
      icon: 'download' as const,
      route: '/(drawer)/export-data',
      iconComponent: Feather,
    },
    {
      label: t('rateUs.title'),
      icon: 'star' as const,
      route: '/(drawer)/rate-us',
      iconComponent: Feather,
    },
    {
      label: t('contactUs.title'),
      icon: 'mail' as const,
      route: '/(drawer)/contact-us',
      iconComponent: Feather,
    },
  ];

  const handleNavigation = (route: string) => {
    router.push(route as any);
    closeDrawer();
    onClose?.();
  };

  return (
    <YStack flex={1} backgroundColor={colors.darkerGray} opacity={0.95}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flex: 1 }}>
        <YStack flex={1} padding="$4" paddingTop="$8">
          {/* Header */}
          <YStack alignItems="center" space="$1" marginBottom="$6">
            <Text color={colors.niceOrange} fontSize="$9" fontWeight="bold">
              {t('common.appName')}
            </Text>
            <Text color={colors.white} fontSize="$4" textAlign="center" opacity={0.7}>
              {t('profile.logAndTrackProgress')}
            </Text>
          </YStack>

          <YStack space="$2" flex={1}>
            {menuItems.map((item) => {
              const IconComponent = item.iconComponent;
              const isActive = pathname?.startsWith(item.route);

              return (
                <Button
                  key={item.route}
                  unstyled
                  onPress={() => handleNavigation(item.route)}
                  backgroundColor={isActive ? colors.midGray : 'transparent'}
                  padding="$3"
                  borderRadius="$3"
                  justifyContent="flex-start"
                >
                  <XStack space="$3" alignItems="center">
                    <IconComponent
                      name={item.icon}
                      size={24}
                      color={colors.midGray}
                      opacity={0.7}
                    />
                    <Text
                      color={isActive ? colors.niceOrange : colors.white}
                      fontSize="$5"
                      fontWeight={isActive ? '600' : '400'}
                    >
                      {item.label}
                    </Text>
                  </XStack>
                </Button>
              );
            })}
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
