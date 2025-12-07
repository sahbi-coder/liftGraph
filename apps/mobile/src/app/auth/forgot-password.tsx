import React, { useState } from 'react';
import { YStack, Text, Input, Button, H1, H3, Image, View, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Entypo from '@expo/vector-icons/Entypo';
import Foundation from '@expo/vector-icons/Foundation';
import { colors } from '@/theme/colors';
import { useAlertModal } from '@/hooks/useAlertModal';
import { useTranslation } from '@/hooks/useTranslation';
import { getAuthErrorMessage } from '@/utils/authErrors';
import { useValidateAuthScreen } from '@/hooks/useValidateAuthScreen';
import { getEmailSchema } from '@/utils/authSchemas';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError, AlertModalComponent } = useAlertModal();
  const { resetPassword } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const { error } = useValidateAuthScreen([
    {
      schema: getEmailSchema(t),
      getValue: () => email,
    },
  ]);

  const handleEmailChange = (text: string) => {
    setEmail(text);
  };

  const handleResetPassword = async () => {
    if (!email) {
      showError(t('auth.pleaseEnterEmail'));
      return;
    }
    if (error) {
      showError(error);
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      showSuccess(t('auth.passwordResetEmailSent'));
      setTimeout(() => {
        router.back();
      }, 3000);
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
    <YStack flex={1} backgroundColor="$background" padding="$4" paddingTop="$10">
      <Image
        source={logoSource}
        width={100}
        height={100}
        alignSelf="center"
        marginBottom="$4"
        borderRadius="$4"
        resizeMode="contain"
      />
      <H1 color="$textPrimary" fontSize="$10" fontWeight="bold" textAlign="center">
        {t('auth.resetPassword')}
      </H1>
      <Text color="$textSecondary" marginBottom="$4" fontSize="$4" textAlign="center">
        {t('auth.resetPasswordInstructions')}
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
        <H3 color="$textPrimary" opacity={0.75} fontSize="$9" fontWeight="bold" textAlign="center">
          {t('auth.wellHelpYouGetBackIn')}
        </H3>

        <YStack space="$3" marginTop="$2">
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

          <XStack justifyContent="center">
            {error && (
              <Text color="$errorColor" fontSize="$3" textAlign="center">
                {error}
              </Text>
            )}
          </XStack>

          <Button
            size="$4"
            backgroundColor="$primaryButton"
            color="$primaryButtonText"
            fontWeight="600"
            onPress={handleResetPassword}
            disabled={buttonDisabled}
            opacity={buttonDisabled ? 0.5 : 1}
          >
            {buttonDisabled ? t('common.sending') : t('auth.sendResetLink')}
          </Button>

          <Button
            size="$3"
            backgroundColor="$secondaryButton"
            color="$secondaryButtonText"
            opacity={0.7}
            onPress={() => router.back()}
          >
            {t('auth.backToLogin')}
          </Button>
        </YStack>
      </YStack>
      <XStack
        space="$6"
        justifyContent="center"
        alignItems="flex-start"
        marginTop="$6"
        marginBottom="$6"
      >
        <YStack alignItems="center" space="$3">
          <YStack padding="$3" alignItems="center" justifyContent="center" position="relative">
            <View
              backgroundColor="$primaryButton"
              position="absolute"
              borderRadius="$5"
              top={0}
              left={0}
              right={0}
              bottom={0}
              opacity={0.3}
            />
            <Entypo name="calendar" size={32} color={colors.niceOrange} />
          </YStack>
          <Text color="$textSecondary" fontWeight="600">
            {t('features.planWorkouts')}
          </Text>
        </YStack>
        <YStack alignItems="center" space="$3">
          <YStack padding="$3" alignItems="center" justifyContent="center" position="relative">
            <View
              backgroundColor="$primaryButton"
              position="absolute"
              borderRadius="$5"
              top={0}
              left={0}
              right={0}
              bottom={0}
              opacity={0.3}
            />
            <Foundation name="graph-trend" size={34} color={colors.niceOrange} />
          </YStack>
          <Text color="$textSecondary" fontWeight="600">
            {t('features.trackProgress')}
          </Text>
        </YStack>
      </XStack>
      <AlertModalComponent />
    </YStack>
  );
}
