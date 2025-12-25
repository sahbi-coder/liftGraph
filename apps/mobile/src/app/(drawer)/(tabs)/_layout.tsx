import React from 'react';
import { Tabs } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import Foundation from '@expo/vector-icons/Foundation';
import Feather from '@expo/vector-icons/Feather';

import { colors } from '@/theme/colors';
import { useTranslation } from '@/hooks/common/useTranslation';

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.niceOrange,
        tabBarInactiveTintColor: colors.midGray,
        tabBarStyle: {
          backgroundColor: colors.darkerGray,
          borderTopColor: colors.midGray,
        },
        headerStyle: {
          backgroundColor: colors.darkerGray,
        },
      }}
    >
      <Tabs.Screen
        name="workout"
        options={{
          title: t('workout.title'),
          tabBarIcon: ({ color, size }) => (
            <Feather name="activity" size={size ?? 24} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="program"
        options={{
          headerShown: false,
          title: t('program.title'),
          tabBarIcon: ({ color, size }) => <Feather name="list" size={size ?? 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          headerShown: false,
          title: t('progress.title'),
          tabBarIcon: ({ color, size }) => (
            <Foundation name="graph-trend" size={size ?? 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: t('schedule.title'),
          tabBarIcon: ({ color, size }) => (
            <Entypo name="calendar" size={size ?? 24} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="components-test"
        options={{
          title: 'Components Test',
          tabBarIcon: ({ color, size }) => (
            <Feather name="layers" size={size ?? 24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
