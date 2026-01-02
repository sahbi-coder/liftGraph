import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Image } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import { useRouter } from 'expo-router';

import { colors } from '@/theme/colors';
import Feather from '@expo/vector-icons/Feather';
import { Scale, Ruler, Thermometer } from '@tamagui/lucide-icons';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useTranslation } from '@/hooks/common/useTranslation';
import { getServiceErrorMessage } from '@/utils/serviceErrors';
import { useAlertModal } from '@/hooks/common/useAlertModal';
import { useDependencies } from '@/dependencies/provider';
import { useAuthenticatedUser } from '@/contexts/AuthContext';
import { LoadingView } from '@/components/StatusViews';

type UnitOption = {
  value: 'kg' | 'lb' | 'cm' | 'ft' | 'celsius' | 'fahrenheit';
  label: string;
  subtitle: string;
  icon: React.ComponentType<any>;
};

export default function UnitsOnboardingScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { preferences, updatePreferences, loading: loadingPreferences } = useUserPreferences();
  const { showError, AlertModalComponent } = useAlertModal();
  const { services } = useDependencies();
  const { user } = useAuthenticatedUser();
  const [loading, setLoading] = useState(false);

  const weightOptions: UnitOption[] = [
    {
      value: 'kg',
      label: t('settings.kilograms'),
      subtitle: t('settings.metricSystem'),
      icon: Scale,
    },
    {
      value: 'lb',
      label: t('settings.pounds'),
      subtitle: t('settings.imperialSystem'),
      icon: Scale,
    },
  ];

  const distanceOptions: UnitOption[] = [
    {
      value: 'cm',
      label: t('settings.centimeters'),
      subtitle: t('settings.metricSystem'),
      icon: Ruler,
    },
    {
      value: 'ft',
      label: t('settings.feetInches'),
      subtitle: t('settings.imperialSystem'),
      icon: Ruler,
    },
  ];

  const temperatureOptions: UnitOption[] = [
    {
      value: 'celsius',
      label: t('settings.celsius'),
      subtitle: t('settings.metricSystem'),
      icon: Thermometer,
    },
    {
      value: 'fahrenheit',
      label: t('settings.fahrenheit'),
      subtitle: t('settings.imperialSystem'),
      icon: Thermometer,
    },
  ];

  const [selectedUnits, setSelectedUnits] = useState({
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
      setLoading(true);
      await updatePreferences({
        ...selectedUnits,
        onboardingCompleted: true,
      });

      const language = i18n.language;
      try {
        await services.firestore.populateProgramsFromLibrary(user.uid, language);
      } catch (error) {
        // Log error but don't block onboarding completion
        console.error('Error populating programs from library:', error);
      }

      router.replace('/');
    } catch (error) {
      const errorMessage = getServiceErrorMessage(error, t);
      showError(errorMessage);
    } finally {
      setLoading(false);
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
          padding="$2"
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
            <Text color={colors.white} fontSize="$4" opacity={0.75}>
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
  if (loadingPreferences) {
    return <LoadingView />;
  }

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
            width={100}
            height={100}
            borderRadius="$4"
            justifyContent="center"
            alignItems="center"
            marginBottom="$4"
          >
            <Image
              source={logoSource}
              style={{ width: 100, height: 100, borderRadius: 8 }}
              resizeMode="contain"
            />
          </YStack>
          <Text color={colors.white} fontSize="$10" fontWeight="bold" textAlign="center">
            {t('onboarding.chooseYourUnits')}
          </Text>
          <Text color={colors.midGray} fontSize="$4" textAlign="center" marginVertical="$3.5">
            {t('onboarding.chooseYourUnitsDescription')}
          </Text>
        </YStack>

        {/* Weight Units */}
        <YStack marginBottom="$6">
          <Text color={colors.white} fontSize="$6" fontWeight="600" marginBottom="$3">
            {t('settings.weightUnits')}
          </Text>
          {weightOptions.map((option) =>
            renderUnitOption(option, 'weightUnit', selectedUnits.weightUnit === option.value),
          )}
        </YStack>

        {/* Distance/Height Units */}
        <YStack marginBottom="$6">
          <Text color={colors.white} fontSize="$6" fontWeight="600" marginBottom="$3">
            {t('settings.distanceHeightUnits')}
          </Text>
          {distanceOptions.map((option) =>
            renderUnitOption(option, 'distanceUnit', selectedUnits.distanceUnit === option.value),
          )}
        </YStack>

        {/* Temperature Units */}
        <YStack marginBottom="$6">
          <Text color={colors.white} fontSize="$6" fontWeight="600" marginBottom="$3">
            {t('settings.temperatureUnits')}
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
            {loading ? t('common.saving') : t('onboarding.continue')}
          </Button>
        </YStack>
      </ScrollView>
      <AlertModalComponent />
    </YStack>
  );
}
