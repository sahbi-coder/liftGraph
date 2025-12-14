import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input, Text, TextArea, XStack, YStack } from 'tamagui';

import { useDependencies } from '@/dependencies/provider';
import { useAuthenticatedUser } from '@/contexts/AuthContext';
import { colors } from '@/theme/colors';
import { ExerciseSelection } from '@/types/workout';
import {
  getExercisePickerCallback,
  clearExercisePickerCallback,
} from '@/contexts/exercisePickerContext';
import { useAlertModal } from '@/hooks/useAlertModal';
import { useTranslation } from '@/hooks/useTranslation';
import { getServiceErrorMessage } from '@/utils/serviceErrors';
import { getDeviceLanguage } from '@/locale/i18n';
import { EXERCISE_CATEGORIES, BODY_PARTS } from '@/services';

export default function CreateExerciseScreen() {
  const router = useRouter();
  const { user } = useAuthenticatedUser();
  const { services } = useDependencies();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [bodyPart, setBodyPart] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { showSuccess, showError, AlertModalComponent } = useAlertModal();

  const handleCreate = async () => {
    if (!name.trim()) {
      showError(t('exercise.exerciseNameRequired'));
      return;
    }

    if (!category.trim()) {
      showError(t('exercise.categoryRequired'));
      return;
    }

    if (!bodyPart.trim()) {
      showError(t('exercise.bodyPartRequired'));
      return;
    }

    try {
      setIsCreating(true);
      const exerciseId = await services.firestore.createExercise(user.uid, getDeviceLanguage(), {
        name: name.trim(),
        category: category.trim(),
        bodyPart: bodyPart.trim(),
        description: description.trim() ?? '',
      });

      // Get the callback and auto-select the newly created exercise
      const contextCallback = getExercisePickerCallback();
      const effectiveOnSelect = contextCallback.callback;
      const effectiveContext = contextCallback.context;

      if (effectiveOnSelect) {
        const newExercise: ExerciseSelection = {
          id: exerciseId,
          name: name.trim(),
        };

        try {
          effectiveOnSelect(newExercise, effectiveContext || undefined);
        } catch (error) {
          console.error('Error executing callback:', error);
        }
        clearExercisePickerCallback();
      }

      showSuccess(t('exercise.exerciseCreatedSuccessfully'));
      // Navigate back after showing success message
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      const message = getServiceErrorMessage(error, t);
      showError(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.darkerGray }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
    >
      <YStack space="$4">
        <YStack space="$2">
          <Text color="$textPrimary" fontSize="$6" fontWeight="600">
            {t('exercise.create')}
          </Text>
          <Text color="$textSecondary" fontSize="$4">
            {t('exercise.addCustomExercise')}
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
              value={category}
              onChangeText={setCategory}
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
              value={bodyPart}
              onChangeText={setBodyPart}
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
            disabled={isCreating}
          >
            {t('common.cancel')}
          </Button>
          <Button
            flex={1}
            backgroundColor="$primaryButton"
            color={colors.white}
            onPress={handleCreate}
            disabled={isCreating}
            opacity={isCreating ? 0.6 : 1}
          >
            {isCreating ? t('common.creating') : t('exercise.createExerciseButton')}
          </Button>
        </XStack>
      </YStack>
      <AlertModalComponent />
    </ScrollView>
  );
}
