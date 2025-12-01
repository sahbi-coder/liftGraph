import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Image } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import { useRouter } from 'expo-router';

import { colors } from '@/theme/colors';
import Feather from '@expo/vector-icons/Feather';
import { Scale, Ruler, Thermometer } from '@tamagui/lucide-icons';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import type { UserPreferences } from '@/domain';

type UnitOption = {
  value: 'kg' | 'lb' | 'cm' | 'ft' | 'celsius' | 'fahrenheit';
  label: string;
  subtitle: string;
  icon: React.ComponentType<any>;
};

const weightOptions: UnitOption[] = [
  {
    value: 'kg',
    label: 'Kilograms (kg)',
    subtitle: 'Metric system',
    icon: Scale,
  },
  {
    value: 'lb',
    label: 'Pounds (lbs)',
    subtitle: 'Imperial system',
    icon: Scale,
  },
];

const distanceOptions: UnitOption[] = [
  {
    value: 'cm',
    label: 'Centimeters (cm)',
    subtitle: 'Metric system',
    icon: Ruler,
  },
  {
    value: 'ft',
    label: 'Feet & Inches',
    subtitle: 'Imperial system',
    icon: Ruler,
  },
];

const temperatureOptions: UnitOption[] = [
  {
    value: 'celsius',
    label: 'Celsius (°C)',
    subtitle: 'Metric system',
    icon: Thermometer,
  },
  {
    value: 'fahrenheit',
    label: 'Fahrenheit (°F)',
    subtitle: 'Imperial system',
    icon: Thermometer,
  },
];

export default function UnitsOnboardingScreen() {
  const router = useRouter();
  const { preferences, updatePreferences, loading } = useUserPreferences();

  const [selectedUnits, setSelectedUnits] = useState<Partial<UserPreferences>>({
    weightUnit: preferences?.weightUnit || 'kg',
    distanceUnit: preferences?.distanceUnit || 'cm',
    temperatureUnit: preferences?.temperatureUnit || 'celsius',
  });

  const logoSource = require('../../../assets/exp-icon.png');

  const handleUnitSelect = (
    type: 'weightUnit' | 'distanceUnit' | 'temperatureUnit',
    value: string,
  ) => {
    setSelectedUnits((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleContinue = async () => {
    try {
      await updatePreferences({
        ...selectedUnits,
        onboardingCompleted: true,
      });
      router.replace('/');
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const renderUnitOption = (
    option: UnitOption,
    type: 'weightUnit' | 'distanceUnit' | 'temperatureUnit',
    isSelected: boolean,
  ) => {
    const IconComponent = option.icon;
    return (
      <TouchableOpacity
        key={option.value}
        onPress={() => handleUnitSelect(type, option.value)}
        activeOpacity={0.7}
        style={{ marginBottom: 12 }}
      >
        <XStack
          backgroundColor={isSelected ? colors.darkGray : colors.midGray}
          borderRadius="$4"
          padding="$4"
          space="$3"
          alignItems="center"
          borderWidth={isSelected ? 2 : 0}
          borderColor={isSelected ? colors.niceOrange : 'transparent'}
        >
          <YStack
            width={50}
            height={50}
            borderRadius="$3"
            backgroundColor={colors.niceOrange}
            justifyContent="center"
            alignItems="center"
            opacity={0.2}
          >
            <IconComponent size={24} color={colors.niceOrange} />
          </YStack>
          <YStack flex={1}>
            <Text color={colors.white} fontSize="$5" fontWeight="600" marginBottom="$1">
              {option.label}
            </Text>
            <Text color={colors.midGray} fontSize="$4">
              {option.subtitle}
            </Text>
          </YStack>
          <YStack
            width={24}
            height={24}
            borderRadius={12}
            borderWidth={2}
            borderColor={isSelected ? colors.niceOrange : colors.midGray}
            backgroundColor={isSelected ? colors.niceOrange : 'transparent'}
            justifyContent="center"
            alignItems="center"
          >
            {isSelected && (
              <YStack width={12} height={12} borderRadius={6} backgroundColor={colors.white} />
            )}
          </YStack>
        </XStack>
      </TouchableOpacity>
    );
  };

  return (
    <YStack flex={1} backgroundColor={colors.darkerGray}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 40, paddingBottom: 40 }}>
        {/* Back button and progress indicator */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$6">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Feather name="arrow-left" size={24} color={colors.white} />
          </TouchableOpacity>
          <XStack space="$1" alignItems="center">
            <YStack width={8} height={8} borderRadius={4} backgroundColor={colors.niceOrange} />
            <YStack width={8} height={8} borderRadius={4} backgroundColor={colors.niceOrange} />
          </XStack>
        </XStack>

        {/* Logo/Icon */}
        <YStack alignItems="center" marginBottom="$6">
          <YStack
            width={80}
            height={80}
            borderRadius="$4"
            backgroundColor={colors.darkGray}
            justifyContent="center"
            alignItems="center"
            marginBottom="$4"
          >
            <Image
              source={logoSource}
              style={{ width: 60, height: 60, borderRadius: 8 }}
              resizeMode="contain"
            />
          </YStack>
          <Text color={colors.white} fontSize="$9" fontWeight="bold" textAlign="center">
            Choose Your Units
          </Text>
          <Text color={colors.midGray} fontSize="$4" textAlign="center" marginTop="$2">
            Select your preferred measurement units for tracking your powerlifting progress.
          </Text>
        </YStack>

        {/* Weight Units */}
        <YStack marginBottom="$6">
          <Text color={colors.white} fontSize="$6" fontWeight="600" marginBottom="$3">
            Weight Units
          </Text>
          {weightOptions.map((option) =>
            renderUnitOption(option, 'weightUnit', selectedUnits.weightUnit === option.value),
          )}
        </YStack>

        {/* Distance/Height Units */}
        <YStack marginBottom="$6">
          <Text color={colors.white} fontSize="$6" fontWeight="600" marginBottom="$3">
            Distance/Height Units
          </Text>
          {distanceOptions.map((option) =>
            renderUnitOption(option, 'distanceUnit', selectedUnits.distanceUnit === option.value),
          )}
        </YStack>

        {/* Temperature Units */}
        <YStack marginBottom="$6">
          <Text color={colors.white} fontSize="$6" fontWeight="600" marginBottom="$3">
            Temperature Units
          </Text>
          {temperatureOptions.map((option) =>
            renderUnitOption(
              option,
              'temperatureUnit',
              selectedUnits.temperatureUnit === option.value,
            ),
          )}
        </YStack>
        {/* Action Buttons */}
        <YStack space="$3">
          <Button
            size="$5"
            backgroundColor={colors.niceOrange}
            color={colors.white}
            fontWeight="600"
            borderRadius="$4"
            onPress={handleContinue}
            disabled={loading}
            opacity={loading ? 0.6 : 1}
            pressStyle={{ opacity: 0.85 }}
          >
            {loading ? 'Saving...' : 'Continue'}
          </Button>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
