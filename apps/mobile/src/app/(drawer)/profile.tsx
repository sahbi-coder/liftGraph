import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import Feather from '@expo/vector-icons/Feather';
import {
  Calendar,
  Dumbbell,
  TrendingUp,
  ArrowUp,
  Share2,
  Camera,
  Trophy,
  Flame,
  Award,
} from '@tamagui/lucide-icons';

import { colors } from '@/theme/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const handleShareProfile = () => {
    // TODO: Implement share profile functionality
    console.log('Share profile');
  };

  // Mock data - replace with actual data from your data source
  const workoutStats = {
    workouts: 156,
    daysStreak: 89,
    totalKg: '12.5k',
  };

  const personalRecords = [
    {
      id: 'squat',
      name: 'Squat',
      value: '185kg',
      change: '+5kg',
      lastUpdated: '3 days ago',
      icon: TrendingUp,
    },
    {
      id: 'bench',
      name: 'Bench Press',
      value: '140kg',
      change: '+2.5kg',
      lastUpdated: '1 week ago',
      icon: Dumbbell,
    },
    {
      id: 'deadlift',
      name: 'Deadlift',
      value: '205kg',
      change: '+7.5kg',
      lastUpdated: '5 days ago',
      icon: ArrowUp,
    },
  ];

  const bodyStats = [
    { label: 'Weight', value: '85.2 kg', change: '-0.8kg', changeColor: '#10b981' },
    { label: 'Body Fat', value: '12.5%', change: '+0.3%', changeColor: '#ef4444' },
    { label: 'Height', value: '178 cm' },
    { label: 'Age', value: '28 years' },
  ];

  const achievements = [
    {
      id: 'deadlift200',
      title: 'First 200kg Deadlift',
      description: 'Unlocked 5 days ago',
      icon: Trophy,
      iconBg: '#92400e',
      iconColor: '#fbbf24',
    },
    {
      id: 'streak90',
      title: '90-Day Streak',
      description: 'Almost there! 1 day to go',
      icon: Flame,
      iconBg: '#1e3a8a',
      iconColor: '#60a5fa',
    },
    {
      id: 'workouts100',
      title: '100 Workouts',
      description: 'Unlocked 2 weeks ago',
      icon: Award,
      iconBg: '#14532d',
      iconColor: '#4ade80',
    },
  ];

  return (
    <YStack flex={1} backgroundColor={colors.darkerGray}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <YStack padding="$4" paddingTop="$10" space="$6">
          {/* User Information */}
          <YStack alignItems="center" space="$3">
            <YStack position="relative">
              <YStack
                width={120}
                height={120}
                borderRadius={60}
                backgroundColor={colors.darkGray}
                borderWidth={3}
                borderColor={colors.niceOrange}
                justifyContent="center"
                alignItems="center"
                overflow="hidden"
              >
                {/* Placeholder for profile image */}
                <YStack
                  width="100%"
                  height="100%"
                  backgroundColor={colors.midGray}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Feather name="user" size={50} color={colors.midGray} />
                </YStack>
              </YStack>
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: colors.niceOrange,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 3,
                  borderColor: colors.darkerGray,
                }}
              >
                <Camera size={18} color={colors.white} />
              </TouchableOpacity>
            </YStack>

            <YStack alignItems="center" space="$1">
              <Text color={colors.white} fontSize="$9" fontWeight="bold">
                {user?.displayName || 'Marcus Johnson'}
              </Text>
              <Text color={colors.white} fontSize="$5">
                {t('profile.powerliftingEnthusiast')}
              </Text>
              <XStack space="$2" alignItems="center" marginTop="$1">
                <Calendar size={16} color={colors.niceOrange} />
                <Text color={colors.white} fontSize="$4">
                  {t('profile.memberSince', { date: 'Jan 2023' })}
                </Text>
              </XStack>
            </YStack>
          </YStack>

          {/* Workout Summary */}
          <XStack space="$3" width="100%">
            <YStack
              flex={1}
              backgroundColor={colors.darkGray}
              borderRadius="$3"
              padding="$4"
              alignItems="center"
              space="$1"
            >
              <Text color={colors.niceOrange} fontSize="$8" fontWeight="bold">
                {workoutStats.workouts}
              </Text>
              <Text color={colors.white} fontSize="$4">
                {t('profile.workouts')}
              </Text>
            </YStack>
            <YStack
              flex={1}
              backgroundColor={colors.darkGray}
              borderRadius="$3"
              padding="$4"
              alignItems="center"
              space="$1"
            >
              <Text color={colors.niceOrange} fontSize="$8" fontWeight="bold">
                {workoutStats.daysStreak}
              </Text>
              <Text color={colors.white} fontSize="$4">
                {t('profile.daysStreak')}
              </Text>
            </YStack>
            <YStack
              flex={1}
              backgroundColor={colors.darkGray}
              borderRadius="$3"
              padding="$4"
              alignItems="center"
              space="$1"
            >
              <Text color={colors.niceOrange} fontSize="$8" fontWeight="bold">
                {workoutStats.totalKg}
              </Text>
              <Text color={colors.white} fontSize="$4">
                {t('profile.totalKg')}
              </Text>
            </YStack>
          </XStack>

          {/* Personal Records */}
          <YStack space="$3">
            <Text color={colors.white} fontSize="$7" fontWeight="bold">
              {t('profile.personalRecords')}
            </Text>
            <YStack space="$2">
              {personalRecords.map((record) => {
                const IconComponent = record.icon;
                return (
                  <XStack
                    key={record.id}
                    backgroundColor={colors.darkGray}
                    borderRadius="$3"
                    padding="$4"
                    space="$3"
                    alignItems="center"
                  >
                    <IconComponent size={24} color={colors.niceOrange} />
                    <YStack flex={1} space="$1">
                      <Text color={colors.white} fontSize="$5" fontWeight="600">
                        {record.name}
                      </Text>
                      <Text color={colors.white} fontSize="$4">
                        {t('profile.lastUpdated', { time: record.lastUpdated })}
                      </Text>
                    </YStack>
                    <YStack alignItems="flex-end" space="$1">
                      <Text color={colors.niceOrange} fontSize="$6" fontWeight="bold">
                        {record.value}
                      </Text>
                      <Text color="#10b981" fontSize="$4" fontWeight="500">
                        {record.change}
                      </Text>
                    </YStack>
                  </XStack>
                );
              })}
            </YStack>
          </YStack>

          {/* Body Stats */}
          <YStack space="$3">
            <Text color={colors.white} fontSize="$7" fontWeight="bold">
              {t('profile.bodyStats')}
            </Text>
            <YStack space="$2">
              <XStack space="$2" width="100%">
                {bodyStats.slice(0, 2).map((stat) => (
                  <YStack
                    key={stat.label}
                    flex={1}
                    backgroundColor={colors.darkGray}
                    borderRadius="$3"
                    padding="$3"
                    space="$1"
                  >
                    <Text color={colors.white} fontSize="$4">
                      {stat.label}
                    </Text>
                    <Text color={colors.white} fontSize="$5" fontWeight="bold">
                      {stat.value}
                    </Text>
                    {stat.change && (
                      <Text color={stat.changeColor} fontSize="$3" fontWeight="500">
                        {stat.change}
                      </Text>
                    )}
                  </YStack>
                ))}
              </XStack>
              <XStack space="$2" width="100%">
                {bodyStats.slice(2, 4).map((stat) => (
                  <YStack
                    key={stat.label}
                    flex={1}
                    backgroundColor={colors.darkGray}
                    borderRadius="$3"
                    padding="$3"
                    space="$1"
                  >
                    <Text color={colors.white} fontSize="$4">
                      {stat.label}
                    </Text>
                    <Text color={colors.white} fontSize="$5" fontWeight="bold">
                      {stat.value}
                    </Text>
                    {stat.change && (
                      <Text color={stat.changeColor} fontSize="$3" fontWeight="500">
                        {stat.change}
                      </Text>
                    )}
                  </YStack>
                ))}
              </XStack>
            </YStack>
          </YStack>

          {/* Recent Achievements */}
          <YStack space="$3">
            <Text color={colors.white} fontSize="$7" fontWeight="bold">
              {t('profile.recentAchievements')}
            </Text>
            <YStack space="$2">
              {achievements.map((achievement) => {
                const IconComponent = achievement.icon;
                return (
                  <XStack
                    key={achievement.id}
                    backgroundColor={colors.darkGray}
                    borderRadius="$3"
                    padding="$4"
                    space="$3"
                    alignItems="center"
                  >
                    <YStack
                      width={48}
                      height={48}
                      borderRadius={24}
                      backgroundColor={achievement.iconBg}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <IconComponent size={24} color={achievement.iconColor} />
                    </YStack>
                    <YStack flex={1} space="$1">
                      <Text color={colors.white} fontSize="$5" fontWeight="600">
                        {achievement.title}
                      </Text>
                      <Text color={colors.white} fontSize="$4">
                        {achievement.description}
                      </Text>
                    </YStack>
                  </XStack>
                );
              })}
            </YStack>
          </YStack>

          {/* Share Profile Button */}
          <Button
            width="100%"
            backgroundColor={colors.niceOrange}
            color={colors.white}
            onPress={handleShareProfile}
            borderRadius="$3"
            padding="$4"
            marginTop="$2"
          >
            <XStack space="$2" alignItems="center">
              <Share2 size={20} color={colors.white} />
              <Text fontSize="$5" fontWeight="600" color={colors.white}>
                {t('profile.shareProfile')}
              </Text>
            </XStack>
          </Button>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
