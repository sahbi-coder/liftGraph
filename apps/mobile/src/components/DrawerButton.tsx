import React from 'react';
import { Pressable, Platform } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useDrawer } from '@/contexts/DrawerContext';
import { colors } from '@/theme/colors';

export function DrawerButton() {
  const { openDrawer } = useDrawer();

  return (
    <Pressable
      onPress={openDrawer}
      style={{
        position: 'relative',
        padding: 8,
        marginRight: 8,
        bottom: Platform.OS === 'ios' ? 5 : 0,
      }}
    >
      <Feather name="menu" size={32} color={colors.white} />
    </Pressable>
  );
}
