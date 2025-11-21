import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { YStack, Text } from 'tamagui';
import Entypo from '@expo/vector-icons/Entypo';
import Foundation from '@expo/vector-icons/Foundation';
import Feather from '@expo/vector-icons/Feather';

import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/theme/colors';

export default function TabsLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Text color="$textPrimary">Loading...</Text>
      </YStack>
    );
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

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
        headerTitleStyle: {
          color: colors.white,
          fontSize: 35,
        },
        headerTintColor: colors.white,
        headerShadowVisible: false,
        headerTitle: 'LiftGraph',
        headerTitleAlign: 'center',
      }}
    >
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
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
          title: 'Programs',
          tabBarIcon: ({ color, size }) => <Feather name="list" size={size ?? 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          headerShown: false,
          title: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <Foundation name="graph-trend" size={size ?? 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, size }) => (
            <Entypo name="calendar" size={size ?? 24} color={color} />
          ),
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
