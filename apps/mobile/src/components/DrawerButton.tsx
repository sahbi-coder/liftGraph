import React from 'react';
import { Pressable } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useDrawer } from '@/contexts/DrawerContext';
import { colors } from '@/theme/colors';

export function DrawerButton() {
  const { openDrawer } = useDrawer();

  return (
    <Pressable
      onPress={openDrawer}
      style={{
        padding: 8,
        marginRight: 8,
      }}
    >
      <Feather name="menu" size={32} color={colors.white} />
    </Pressable>
  );
}
