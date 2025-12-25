import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, ScrollView } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { Check } from '@tamagui/lucide-icons';
import { colors } from '@/theme/colors';
import { useTranslation } from '@/hooks/common/useTranslation';
import i18n, { changeLanguage } from '@/locale/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { useDependencies } from '@/dependencies/provider';

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
  const { t, i18n: i18nInstance } = useTranslation();
  const { user } = useAuth();
  const { services } = useDependencies();
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18nInstance.language);
  const previousLanguageRef = useRef<string | null>(null);
  const userRef = useRef(user);
  const servicesRef = useRef(services);
  const isMountedRef = useRef(true);

  const languages = getLanguageOptions(t);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Keep refs up to date
  useEffect(() => {
    userRef.current = user;
    servicesRef.current = services;
  }, [user, services]);

  // Initialize previous language on mount
  useEffect(() => {
    if (previousLanguageRef.current === null) {
      previousLanguageRef.current = i18nInstance.language;
    }
  }, [i18nInstance]);

  // Handle exercise syncing on language change
  useEffect(() => {
    const handleExerciseSync = async (newLanguage: string) => {
      const oldLanguage = previousLanguageRef.current;
      const currentUser = userRef.current;
      const currentServices = servicesRef.current;

      // Skip if no user or if old language is same as new
      if (!currentUser || !oldLanguage || oldLanguage === newLanguage) {
        previousLanguageRef.current = newLanguage;
        return;
      }

      try {
        if (isMountedRef.current) {
          setIsSyncing(true);
        }
        await currentServices.firestore.syncExercisesFromLanguage(
          currentUser.uid,
          oldLanguage,
          newLanguage,
        );
      } catch (error) {
        console.error('Failed to sync exercises on language change:', error);
      } finally {
        if (isMountedRef.current) {
          setIsSyncing(false);
        }
        previousLanguageRef.current = newLanguage;
      }
    };

    // Listen to language changes for exercise sync
    i18n.on('languageChanged', handleExerciseSync);

    return () => {
      i18n.off('languageChanged', handleExerciseSync);
    };
  }, []); // Empty deps - setup listener once, use refs for latest values

  // Update current language when i18n language changes
  useEffect(() => {
    const updateLanguage = () => {
      setCurrentLanguage(i18nInstance.language);
    };

    updateLanguage();
    i18nInstance.on('languageChanged', updateLanguage);

    return () => {
      i18nInstance.off('languageChanged', updateLanguage);
    };
  }, [i18nInstance]);

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

  if (isSyncing) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={colors.darkerGray}
      >
        <Text color={colors.white}>{t('common.loading')}</Text>
      </YStack>
    );
  }

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
