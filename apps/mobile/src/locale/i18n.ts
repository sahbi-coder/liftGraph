import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './translations/en.json';
import es from './translations/es.json';
import fr from './translations/fr.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
};

// Supported languages
const SUPPORTED_LANGUAGES = ['en', 'es', 'fr'] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Check if a language is supported
const isSupportedLanguage = (lang: string): lang is SupportedLanguage => {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
};

// Get device language or default to 'en'
// If device language is not supported, falls back to 'en'
const getDeviceLanguage = (): string => {
  const locales = getLocales();
  const deviceLanguage = locales[0]?.languageCode?.toLowerCase() ?? 'en';
  // Check if we support this language, otherwise default to 'en'
  return isSupportedLanguage(deviceLanguage) ? deviceLanguage : 'en';
};

// Initialize i18n
i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  compatibilityJSON: 'v4',
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  react: {
    useSuspense: false, // Disable suspense for React Native
  },
});

// Function to change language and save it
// If the language is not supported, falls back to 'en'
export const changeLanguage = async (languageCode: string) => {
  try {
    const normalizedLang = languageCode.toLowerCase();
    const finalLang = isSupportedLanguage(normalizedLang) ? normalizedLang : 'en';

    await i18n.changeLanguage(finalLang);
    await AsyncStorage.setItem('languageCode', finalLang);

    if (!isSupportedLanguage(normalizedLang)) {
      console.warn(`Language ${languageCode} is not supported, falling back to 'en'`);
    }
  } catch (error) {
    console.error('Failed to change language:', error);
    // Fallback to 'en' on error
    await i18n.changeLanguage('en');
  }
};

// Load saved language preference
const loadSavedLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('languageCode');
    if (savedLanguage) {
      await changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.error('Failed to load saved language:', error);
  }
};

// Load saved language on initialization
loadSavedLanguage();

export default i18n;
