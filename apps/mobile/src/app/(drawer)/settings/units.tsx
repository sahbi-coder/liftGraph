import React, { useState } from 'react';
import { TouchableOpacity, ScrollView } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { Scale, Ruler, Thermometer } from '@tamagui/lucide-icons';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useAlertModal } from '@/hooks/useAlertModal';
import { useTranslation } from '@/hooks/useTranslation';
import { getServiceErrorMessage } from '@/utils/serviceErrors';

type UnitOption = {
  value: 'kg' | 'lb' | 'cm' | 'ft' | 'celsius' | 'fahrenheit';
  label: string;
  subtitle: string;
  icon: React.ComponentType<any>;
};

const getWeightOptions = (t: any): UnitOption[] => [
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

const getDistanceOptions = (t: any): UnitOption[] => [
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

const getTemperatureOptions = (t: any): UnitOption[] => [
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

export default function UnitsSettingsScreen() {
  const router = useRouter();
  const { preferences, updatePreferences, loading } = useUserPreferences();
  const [selectedUnits, setSelectedUnits] = useState({
    weightUnit: preferences?.weightUnit || 'kg',
    distanceUnit: preferences?.distanceUnit || 'cm',
    temperatureUnit: preferences?.temperatureUnit || 'celsius',
  });
  const { showSuccess, showError, AlertModalComponent } = useAlertModal();
  const { t } = useTranslation();

  const weightOptions = getWeightOptions(t);
  const distanceOptions = getDistanceOptions(t);
  const temperatureOptions = getTemperatureOptions(t);

  const handleUnitSelect = (
    type: 'weightUnit' | 'distanceUnit' | 'temperatureUnit',
    value: string,
  ) => {
    setSelectedUnits((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await updatePreferences(selectedUnits);
      showSuccess(t('settings.preferencesSavedSuccessfully'));
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      const message = getServiceErrorMessage(error, t);
      showError(message);
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

  return (
    <YStack flex={1} backgroundColor={colors.darkerGray}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 40, paddingBottom: 40 }}>
        <Text color={colors.midGray} fontSize="$4" marginBottom="$6">
          {t('settings.selectPreferredUnits')}
        </Text>

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
        {/* Save Button */}
        <YStack space="$3">
          <Button
            size="$5"
            backgroundColor={colors.niceOrange}
            color={colors.white}
            fontWeight="600"
            borderRadius="$4"
            onPress={handleSave}
            disabled={loading}
            opacity={loading ? 0.6 : 1}
            pressStyle={{ opacity: 0.85 }}
          >
            {loading ? t('common.saving') : t('settings.saveChanges')}
          </Button>
        </YStack>
      </ScrollView>

      <AlertModalComponent />
    </YStack>
  );
}
