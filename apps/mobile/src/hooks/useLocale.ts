import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { Locale } from '../locale/dao';

export const useLocale = (): [string, (locale: string) => Promise<void>, boolean] => {
  const [locale, _setLocale] = useState<string>(new Locale().get());
  const [loading, setLoading] = useState<boolean>(true);

  // Ensures that the locale is reloaded when the screen is re-focused
  useFocusEffect(
    useCallback(() => {
      const loadLocale = async () => {
        setLoading(true);
        try {
          const storedLocale = await AsyncStorage.getItem('languageCode');
          if (storedLocale) {
            _setLocale(storedLocale);
          }
        } catch (error) {
          console.error('Failed to load locale:', error);
        } finally {
          setLoading(false);
        }
      };

      loadLocale();
    }, []),
  );

  const setLocale = async (newLocale: string) => {
    setLoading(true);
    try {
      await AsyncStorage.setItem('languageCode', newLocale);
      _setLocale(newLocale);
    } catch (error) {
      console.error('Failed to set locale:', error);
    } finally {
      setLoading(false);
    }
  };

  return [locale, setLocale, loading];
};
