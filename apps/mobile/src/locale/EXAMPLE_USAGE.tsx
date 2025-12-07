/**
 * Example usage of translations in components
 *
 * This file demonstrates how to use the i18n system in your React Native components.
 * Copy these patterns to your actual components.
 */

import React from 'react';
import { Text, Button, Input } from 'tamagui';
import { useTranslation } from '@/hooks/useTranslation';
import { changeLanguage } from '@/locale/i18n';

// Example 1: Basic translation
export function BasicTranslationExample() {
  const { t } = useTranslation();

  return (
    <>
      <Text>{t('auth.welcomeBack')}</Text>
      <Text>{t('common.loading')}</Text>
    </>
  );
}

// Example 2: Translation with dynamic values
export function TranslationWithVariables() {
  const { t } = useTranslation();
  const userName = 'John';

  // Note: To use variables, you'll need to add them to your translation files
  // For example: "welcome": "Welcome, {{name}}!"
  // Then use: t('auth.welcome', { name: userName })
  return <Text>{t('auth.welcomeBack')}</Text>;
}

// Example 3: Changing language
export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { t } = useTranslation();

  return (
    <>
      <Text>Current language: {i18n.language}</Text>
      <Button onPress={() => changeLanguage('en')}>English</Button>
      <Button onPress={() => changeLanguage('es')}>Español</Button>
      <Button onPress={() => changeLanguage('fr')}>Français</Button>
    </>
  );
}

// Example 4: Using translations in form placeholders
export function FormWithTranslations() {
  const { t } = useTranslation();
  const [email, setEmail] = React.useState('');

  return <Input placeholder={t('auth.email')} value={email} onChangeText={setEmail} />;
}

// Example 5: Conditional translations
export function ConditionalTranslation() {
  const { t } = useTranslation();
  const isLoading = false;

  return <Button>{isLoading ? t('auth.signingIn') : t('auth.signIn')}</Button>;
}

// Example 6: Complete login form example (how you would update login.tsx)
export function LoginFormExample() {
  const { t } = useTranslation();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      // Use translation for error messages
      // showError(t('auth.pleaseEnterEmailPassword'));
      return;
    }
    // ... rest of login logic
  };

  return (
    <>
      <Text>{t('auth.welcomeBack')}</Text>
      <Text>{t('auth.tagline')}</Text>
      <Input placeholder={t('auth.email')} value={email} onChangeText={setEmail} />
      <Input placeholder={t('auth.password')} value={password} onChangeText={setPassword} />
      <Button onPress={handleLogin} disabled={loading}>
        {loading ? t('auth.signingIn') : t('auth.signIn')}
      </Button>
    </>
  );
}
