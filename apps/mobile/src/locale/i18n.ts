import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocaleConfig } from 'react-native-calendars';

import en from './translations/en.json';
import es from './translations/es.json';
import fr from './translations/fr.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
};

// Supported languages
export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Check if a language is supported
const isSupportedLanguage = (lang: any): lang is SupportedLanguage => {
  return SUPPORTED_LANGUAGES.includes(lang);
};

// Get device language or default to 'en'
// If device language is not supported, falls back to 'en'
const getDeviceLanguage = () => {
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

// Get the current i18n language
export const getCurrentLanguage = (): SupportedLanguage => {
  return (i18n.language as SupportedLanguage) || 'en';
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

// Configure calendar locales
LocaleConfig.locales['en'] = {
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  monthNamesShort: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: 'Today',
};

LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ],
  monthNamesShort: [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy',
};

LocaleConfig.locales['fr'] = {
  monthNames: [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ],
  monthNamesShort: [
    'Janv.',
    'Févr.',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juil.',
    'Août',
    'Sept.',
    'Oct.',
    'Nov.',
    'Déc.',
  ],
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
  today: "Aujourd'hui",
};

// Function to sync calendar locale with i18n language
const syncCalendarLocale = (language: string) => {
  const normalizedLang = language.toLowerCase();
  if (isSupportedLanguage(normalizedLang)) {
    LocaleConfig.defaultLocale = normalizedLang;
  } else {
    LocaleConfig.defaultLocale = 'en';
  }
};

// Initialize calendar locale with current language
syncCalendarLocale(i18n.language || 'en');

// Listen for language changes and sync calendar locale
i18n.on('languageChanged', (lng) => {
  syncCalendarLocale(lng);
});

// Load saved language on initialization
loadSavedLanguage();

export default i18n;
