import React from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import { useRouter, usePathname } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

import { useDrawer } from '@/contexts/DrawerContext';
import { colors } from '@/theme/colors';

type DrawerContentProps = {
  onClose?: () => void;
};

export function DrawerContent({ onClose }: DrawerContentProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { closeDrawer } = useDrawer();

  const menuItems = [
    {
      label: 'Profile',
      icon: 'user',
      route: '/(drawer)/profile',
      iconComponent: Feather,
    },
    {
      label: 'Settings',
      icon: 'settings',
      route: '/(drawer)/settings',
      iconComponent: Feather,
    },
  ];

  const handleNavigation = (route: string) => {
    router.push(route as any);
    closeDrawer();
    onClose?.();
  };

  return (
    <YStack flex={1} backgroundColor={colors.darkerGray}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flex: 1 }}>
        <YStack flex={1} padding="$4" paddingTop="$8">
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
                      name={item.icon as any}
                      size={24}
                      color={isActive ? colors.niceOrange : colors.midGray}
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
