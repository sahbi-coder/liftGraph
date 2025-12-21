import React, { useState, useEffect } from 'react';
import { TouchableOpacity, ScrollView } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { Check } from '@tamagui/lucide-icons';
import { colors } from '@/theme/colors';
import { useTranslation } from '@/hooks/common/useTranslation';
import { changeLanguage } from '@/locale/i18n';

type LanguageOption = {
  code: 'en' | 'es' | 'fr';
  label: string;
  nativeName: string;
};

const getLanguageOptions = (t: any): LanguageOption[] => [
  {
    code: 'en',
    label: t('settings.english'),
    nativeName: 'English',
  },
  {
    code: 'es',
    label: t('settings.spanish'),
    nativeName: 'Español',
  },
  {
    code: 'fr',
    label: t('settings.french'),
    nativeName: 'Français',
  },
];

export default function LanguageSettingsScreen() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language);

  const languages = getLanguageOptions(t);

  // Update current language when i18n language changes
  useEffect(() => {
    const updateLanguage = () => {
      setCurrentLanguage(i18n.language);
    };

    updateLanguage();
    i18n.on('languageChanged', updateLanguage);

    return () => {
      i18n.off('languageChanged', updateLanguage);
    };
  }, [i18n]);

  const handleLanguageSelect = async (languageCode: string) => {
    if (languageCode === currentLanguage || loading) {
      return;
    }

    setLoading(true);
    try {
      await changeLanguage(languageCode);
      // Language will be updated via the languageChanged event listener
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderLanguageOption = (language: LanguageOption, isSelected: boolean) => {
    return (
      <TouchableOpacity
        key={language.code}
        onPress={() => handleLanguageSelect(language.code)}
        activeOpacity={0.7}
        style={{ marginBottom: 12 }}
        disabled={loading}
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
          <YStack flex={1} justifyContent="center">
            <Text color={colors.white} fontSize="$5" fontWeight="600">
              {language.nativeName}
            </Text>
          </YStack>
          {isSelected && <Check size={24} color={colors.niceOrange} />}
        </XStack>
      </TouchableOpacity>
    );
  };

  return (
    <YStack flex={1} backgroundColor={colors.darkerGray}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 16, paddingBottom: 40 }}>
        <Text color={colors.midGray} fontSize="$4" marginBottom="$6">
          {t('settings.selectPreferredLanguage')}
        </Text>

        <YStack>
          {languages.map((language) =>
            renderLanguageOption(language, language.code === currentLanguage),
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
