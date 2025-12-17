import React, { useState } from 'react';
import { YStack, XStack, Text, Input, Button, H1, H3, Image } from 'tamagui';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { PasswordInput } from '@/components/PasswordInput';
import { useAlertModal } from '@/hooks/useAlertModal';
import { useTranslation } from '@/hooks/useTranslation';
import { getAuthErrorMessage } from '@/utils/authErrors';
import { useValidateAuthScreen } from '@/hooks/useValidateAuthScreen';
import {
  getNameSchema,
  getEmailSchema,
  getPasswordSchemaForSignup,
  getConfirmPasswordSchema,
} from '@/utils/authSchemas';
import { ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';
import { useKeyboardAnimation } from '@/hooks/useKeyboardAnimation';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showError, AlertModalComponent } = useAlertModal();
  const { signUp } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const { animatedStyle } = useKeyboardAnimation({
    translateY: -200,
    durationUp: 250,
    durationDown: 100,
  });

  const { error } = useValidateAuthScreen([
    {
      schema: getNameSchema(t),
      getValue: () => name,
    },
    {
      schema: getEmailSchema(t),
      getValue: () => email,
    },
    {
      schema: getPasswordSchemaForSignup(t),
      getValue: () => password,
    },
    {
      schema: () => getConfirmPasswordSchema(password, t),
      getValue: () => confirmPassword,
    },
  ]);

  const handleNameChange = (text: string) => {
    setName(text);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      showError(t('auth.pleaseFillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      showError(t('auth.passwordsDoNotMatch'));
      return;
    }
    if (error) {
      showError(t(error));
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name);
      router.replace('/');
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error, t);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logoSource = require('../../../assets/exp-icon.png');
  const buttonDisabled = loading || !!error;

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: '$background' }}
    >
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <YStack flex={1} backgroundColor="$background" padding="$4" paddingTop="$10">
          <Image
            source={logoSource}
            width={100}
            height={100}
            alignSelf="center"
            marginBottom="$2"
            borderRadius="$4"
            resizeMode="contain"
          />
          <H1 color="$textPrimary" fontSize="$10" fontWeight="bold" textAlign="center">
            {t('auth.createAccount')}
          </H1>
          <Text color="$textSecondary" marginVertical="$3.5" fontSize="$4" textAlign="center">
            {t('auth.joinTagline')}
          </Text>
          <YStack
            space="$4"
            maxWidth={400}
            width="100%"
            alignSelf="center"
            padding="$4"
            backgroundColor="$secondarybackground"
            borderRadius="$4"
          >
            <H3
              color="$textPrimary"
              opacity={0.75}
              fontSize="$9"
              fontWeight="bold"
              textAlign="center"
            >
              {t('auth.letsGetStarted')}
            </H3>
            <YStack space="$3" marginTop="$2">
              <Input
                size="$4"
                placeholder={t('auth.fullName')}
                value={name}
                onChangeText={handleNameChange}
                borderColor="$inputFieldBorder"
                backgroundColor="$inputFieldBackground"
                placeholderTextColor="$inputFieldPlaceholderText"
                color="$inputFieldText"
                focusStyle={{ borderColor: '$inputFieldFocusBorder' }}
              />

              <Input
                size="$4"
                placeholder={t('auth.email')}
                value={email}
                onChangeText={handleEmailChange}
                autoCapitalize="none"
                keyboardType="email-address"
                borderColor="$inputFieldBorder"
                backgroundColor="$inputFieldBackground"
                placeholderTextColor="$inputFieldPlaceholderText"
                color="$inputFieldText"
                focusStyle={{ borderColor: '$inputFieldFocusBorder' }}
              />

              <PasswordInput value={password} onChangeText={handlePasswordChange} />
              <PasswordInput
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                placeholder={t('auth.confirmPassword')}
              />

              <XStack justifyContent="center">
                {error && (
                  <Text color="$errorColor" fontSize="$3" textAlign="center">
                    {t(error)}
                  </Text>
                )}
              </XStack>
              <Button
                size="$4"
                backgroundColor="$primaryButton"
                color="$primaryButtonText"
                fontWeight="600"
                onPress={handleSignup}
                disabled={buttonDisabled}
                opacity={buttonDisabled ? 0.5 : 1}
              >
                {loading ? t('auth.creatingAccount') : t('auth.signUp')}
              </Button>
            </YStack>
          </YStack>

          <XStack space="$2" justifyContent="center" marginTop="$4">
            <Text color="$textSecondary">{t('auth.alreadyHaveAccount')}</Text>
            <Text color="$textTertiary" fontWeight="600" onPress={() => router.push('/auth/login')}>
              {t('auth.signIn')}
            </Text>
          </XStack>

          <AlertModalComponent />
        </YStack>
      </Animated.View>
    </ScrollView>
  );
}
