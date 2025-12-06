import React, { useState } from 'react';
import { YStack, XStack, Text, Input, Button, H1, H3, Image, View } from 'tamagui';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Entypo from '@expo/vector-icons/Entypo';
import Foundation from '@expo/vector-icons/Foundation';
import { colors } from '@/theme/colors';
import { PasswordInput } from '@/components/PasswordInput';
import { useAlertModal } from '@/hooks/useAlertModal';
import { useTranslation } from '@/hooks/useTranslation';
import { getAuthErrorMessage } from '@/utils/authErrors';

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

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      showError(t('auth.pleaseFillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      showError(t('auth.passwordsDoNotMatch'));
      return;
    }

    if (password.length < 6) {
      showError(t('auth.passwordMinLength'));
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name);
      router.replace('/' as any);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error, t);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logoSource = require('../../../assets/exp-icon.png');

  return (
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
      <Text color="$textSecondary" marginBottom="$2" fontSize="$4" textAlign="center">
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
        <H3 color="$textPrimary" opacity={0.75} fontSize="$9" fontWeight="bold" textAlign="center">
          {t('auth.letsGetStarted')}
        </H3>
        <YStack space="$3" marginTop="$2">
          <Input
            size="$4"
            placeholder={t('auth.fullName')}
            value={name}
            onChangeText={setName}
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
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            borderColor="$inputFieldBorder"
            backgroundColor="$inputFieldBackground"
            placeholderTextColor="$inputFieldPlaceholderText"
            color="$inputFieldText"
            focusStyle={{ borderColor: '$inputFieldFocusBorder' }}
          />

          <PasswordInput value={password} onChangeText={setPassword} />

          <PasswordInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t('auth.confirmPassword')}
          />

          <Button
            size="$4"
            backgroundColor="$primaryButton"
            color="$primaryButtonText"
            fontWeight="600"
            onPress={handleSignup}
            disabled={loading}
            opacity={loading ? 0.5 : 1}
          >
            {loading ? t('auth.creatingAccount') : t('auth.signUp')}
          </Button>
        </YStack>
      </YStack>
      <XStack space="$2" justifyContent="center" marginTop="$4">
        <Text color="$textSecondary">{t('auth.alreadyHaveAccount')}</Text>
        <Text
          color="$accentColor"
          fontWeight="600"
          onPress={() => router.push('/auth/login' as any)}
        >
          {t('auth.signIn')}
        </Text>
      </XStack>
      <XStack
        space="$6"
        justifyContent="center"
        alignItems="flex-start"
        marginTop="$2"
        marginBottom="$6"
      >
        <YStack alignItems="center" space="$3">
          <YStack padding="$2" alignItems="center" justifyContent="center" position="relative">
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
          <YStack padding="$2" alignItems="center" justifyContent="center" position="relative">
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
