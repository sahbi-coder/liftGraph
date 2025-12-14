import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button, Input, Text, TextArea, XStack, YStack } from 'tamagui';

import { useDependencies } from '@/dependencies/provider';
import { useAuthenticatedUser } from '@/contexts/AuthContext';
import { colors } from '@/theme/colors';
import { useAlertModal } from '@/hooks/useAlertModal';
import { useTranslation } from '@/hooks/useTranslation';
import { getServiceErrorMessage } from '@/utils/serviceErrors';
import { useQuery } from '@tanstack/react-query';
import { getDeviceLanguage } from '@/locale/i18n';
import { EXERCISE_CATEGORIES, BODY_PARTS } from '@/services';

const language = getDeviceLanguage();

export default function EditExerciseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthenticatedUser();
  const { services } = useDependencies();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [bodyPart, setBodyPart] = useState('');
  const [customBodyPart, setCustomBodyPart] = useState('');
  const [description, setDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { showSuccess, showError, AlertModalComponent } = useAlertModal();

  // Fetch exercise data
  const {
    data: exercise,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['exercise', user.uid, id],
    queryFn: async () => {
      if (!id) {
        return null;
      }
      return services.firestore.getExercise(user.uid, id, language);
    },
    enabled: !!id,
  });

  // Populate form when exercise data is loaded
  useEffect(() => {
    if (exercise) {
      setName(exercise.name);
      // Check if category/bodyPart is in the predefined lists
      const isCustomCategory = !EXERCISE_CATEGORIES.includes(exercise.category);
      const isCustomBodyPart = !BODY_PARTS.includes(exercise.bodyPart);

      if (isCustomCategory) {
        setCategory('Other');
        setCustomCategory(exercise.category);
      } else {
        setCategory(exercise.category);
        setCustomCategory('');
      }

      if (isCustomBodyPart) {
        setBodyPart('Other');
        setCustomBodyPart(exercise.bodyPart);
      } else {
        setBodyPart(exercise.bodyPart);
        setCustomBodyPart('');
      }

      setDescription(exercise.description || '');
    }
  }, [exercise]);

  const handleUpdate = async () => {
    if (!id) {
      showError('Exercise ID is missing');
      return;
    }

    if (!name.trim()) {
      showError(t('exercise.exerciseNameRequired'));
      return;
    }

    const finalCategory = category === 'Other' ? customCategory.trim() : category.trim();
    const finalBodyPart = bodyPart === 'Other' ? customBodyPart.trim() : bodyPart.trim();

    if (!finalCategory) {
      showError(t('exercise.categoryRequired'));
      return;
    }

    if (!finalBodyPart) {
      showError(t('exercise.bodyPartRequired'));
      return;
    }

    try {
      setIsUpdating(true);

      await services.firestore.updateExercise(user.uid, id, language, {
        name: name.trim(),
        category: finalCategory,
        bodyPart: finalBodyPart,
        description: description.trim(),
      });

      showSuccess(t('exercise.exerciseUpdatedSuccessfully'));
      // Navigate back after showing success message
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      const message = getServiceErrorMessage(error, t);
      showError(message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <YStack
        flex={1}
        backgroundColor={colors.darkerGray}
        justifyContent="center"
        alignItems="center"
      >
        <Text color={colors.white}>{t('exercise.loadingExercises')}</Text>
      </YStack>
    );
  }

  if (isError || !exercise) {
    return (
      <YStack
        flex={1}
        backgroundColor={colors.darkerGray}
        justifyContent="center"
        alignItems="center"
        padding="$4"
        space="$4"
      >
        <Text color="$textPrimary" fontSize="$5" textAlign="center">
          {t('exercise.failedToLoadExercise') || 'Failed to load exercise'}
        </Text>
        <Button backgroundColor="$primaryButton" color={colors.white} onPress={() => router.back()}>
          {t('common.back')}
        </Button>
      </YStack>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.darkerGray }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
    >
      <YStack space="$4">
        <YStack space="$2">
          <Text color="$textPrimary" fontSize="$6" fontWeight="600">
            {t('exercise.edit') || 'Edit Exercise'}
          </Text>
          <Text color="$textSecondary" fontSize="$4">
            {t('exercise.editCustomExercise') || 'Modify your custom exercise'}
          </Text>
        </YStack>

        <YStack space="$2">
          <Text color="$textPrimary" fontSize="$5" fontWeight="600">
            {t('exercise.exerciseName')} *
          </Text>
          <Input
            value={name}
            onChangeText={setName}
            placeholder={t('exercise.exerciseNamePlaceholder')}
            borderColor="$inputFieldBorder"
            backgroundColor="$inputFieldBackground"
            color="$textPrimary"
            placeholderTextColor="$inputFieldPlaceholderText"
          />
        </YStack>

        <YStack space="$2">
          <Text color="$textPrimary" fontSize="$5" fontWeight="600">
            {t('exercise.category')} *
          </Text>
          <YStack space="$2">
            {EXERCISE_CATEGORIES.map((cat) => (
              <Button
                key={cat}
                backgroundColor={category === cat ? '$primaryButton' : colors.midGray}
                color={colors.white}
                onPress={() => setCategory(cat)}
                borderRadius="$4"
              >
                {t(`exercise.${cat.toLowerCase()}`) || cat}
              </Button>
            ))}
          </YStack>
          {category === 'Other' && (
            <Input
              value={customCategory}
              onChangeText={setCustomCategory}
              placeholder={t('exercise.enterCustomCategory')}
              borderColor="$inputFieldBorder"
              backgroundColor="$inputFieldBackground"
              color="$textPrimary"
              placeholderTextColor="$inputFieldPlaceholderText"
              marginTop="$2"
            />
          )}
        </YStack>

        <YStack space="$2">
          <Text color="$textPrimary" fontSize="$5" fontWeight="600">
            {t('exercise.bodyPart')} *
          </Text>
          <YStack space="$2">
            {BODY_PARTS.map((part) => (
              <Button
                key={part}
                backgroundColor={bodyPart === part ? '$primaryButton' : colors.midGray}
                color={colors.white}
                onPress={() => setBodyPart(part)}
                borderRadius="$4"
              >
                {t(`exercise.${part.toLowerCase()}`) || part}
              </Button>
            ))}
          </YStack>
          {bodyPart === 'Other' && (
            <Input
              value={customBodyPart}
              onChangeText={setCustomBodyPart}
              placeholder={t('exercise.enterCustomBodyPart')}
              borderColor="$inputFieldBorder"
              backgroundColor="$inputFieldBackground"
              color="$textPrimary"
              placeholderTextColor="$inputFieldPlaceholderText"
              marginTop="$2"
            />
          )}
        </YStack>

        <YStack space="$2">
          <Text color="$textPrimary" fontSize="$5" fontWeight="600">
            {t('exercise.description')}
          </Text>
          <TextArea
            value={description}
            onChangeText={setDescription}
            placeholder={t('exercise.descriptionPlaceholder')}
            borderColor="$inputFieldBorder"
            backgroundColor="$inputFieldBackground"
            color="$textPrimary"
            placeholderTextColor="$inputFieldPlaceholderText"
            minHeight={100}
          />
        </YStack>

        <XStack space="$3" marginTop="$2">
          <Button
            flex={1}
            backgroundColor={colors.midGray}
            color={colors.white}
            onPress={() => router.back()}
            disabled={isUpdating}
          >
            {t('common.cancel')}
          </Button>
          <Button
            flex={1}
            backgroundColor="$primaryButton"
            color={colors.white}
            onPress={handleUpdate}
            disabled={isUpdating}
            opacity={isUpdating ? 0.6 : 1}
          >
            {isUpdating ? t('common.saving') : t('common.save')}
          </Button>
        </XStack>
      </YStack>
      <AlertModalComponent />
    </ScrollView>
  );
}
