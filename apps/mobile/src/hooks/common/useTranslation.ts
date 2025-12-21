import { useTranslation as useI18nTranslation } from 'react-i18next';

/**
 * Custom hook that wraps react-i18next's useTranslation
 * Provides type-safe translation access with the 't' function
 *
 * @example
 * const { t } = useTranslation();
 * <Text>{t('auth.welcomeBack')}</Text>
 */
export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();
  return { t, i18n };
};
