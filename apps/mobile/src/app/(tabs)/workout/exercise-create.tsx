import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input, Text, TextArea, XStack, YStack } from 'tamagui';

import { useDependencies } from '@/dependencies/provider';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/theme/colors';
import { ExerciseSelection } from '@/types/workout';
import {
  getExercisePickerCallback,
  clearExercisePickerCallback,
} from '@/contexts/exercisePickerContext';

const EXERCISE_CATEGORIES = [
  'Barbell',
  'Dumbbell',
  'Bodyweight',
  'Machine',
  'Cable',
  'Kettlebell',
  'Other',
];

const BODY_PARTS = [
  'Chest',
  'Back',
  'Shoulders',
  'Legs',
  'Biceps',
  'Triceps',
  'Forearms',
  'Abs',
  'Glutes',
  'Calves',
  'Other',
];

export default function CreateExerciseScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { services } = useDependencies();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [bodyPart, setBodyPart] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to create exercises.');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Validation Error', 'Exercise name is required.');
      return;
    }

    if (!category.trim()) {
      Alert.alert('Validation Error', 'Category is required.');
      return;
    }

    if (!bodyPart.trim()) {
      Alert.alert('Validation Error', 'Body part is required.');
      return;
    }

    try {
      setIsCreating(true);
      const exerciseId = await services.firestore.createExercise(user.uid, {
        name: name.trim(),
        category: category.trim(),
        bodyPart: bodyPart.trim(),
        description: description.trim() || undefined,
      });

      // Get the callback and auto-select the newly created exercise
      const contextCallback = getExercisePickerCallback();
      const effectiveOnSelect = contextCallback.callback;
      const effectiveContext = contextCallback.context;

      if (effectiveOnSelect) {
        const newExercise: ExerciseSelection = {
          id: exerciseId,
          name: name.trim(),
          source: 'user',
        };

        try {
          effectiveOnSelect(newExercise, effectiveContext || undefined);
        } catch (error) {
          console.error('Error executing callback:', error);
        }
        clearExercisePickerCallback();
      }

      Alert.alert('Success', 'Exercise created successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create exercise.';
      Alert.alert('Error', message);
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
            Create Exercise
          </Text>
          <Text color="$textSecondary" fontSize="$4">
            Add a custom exercise to your library
          </Text>
        </YStack>

        <YStack space="$2">
          <Text color="$textPrimary" fontSize="$5" fontWeight="600">
            Exercise Name *
          </Text>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="e.g., Custom Bench Press"
            borderColor="$inputFieldBorder"
            backgroundColor="$inputFieldBackground"
            color="$textPrimary"
            placeholderTextColor="$inputFieldPlaceholderText"
          />
        </YStack>

        <YStack space="$2">
          <Text color="$textPrimary" fontSize="$5" fontWeight="600">
            Category *
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
                {cat}
              </Button>
            ))}
          </YStack>
          {category === 'Other' && (
            <Input
              value={category}
              onChangeText={setCategory}
              placeholder="Enter custom category"
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
            Body Part *
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
                {part}
              </Button>
            ))}
          </YStack>
          {bodyPart === 'Other' && (
            <Input
              value={bodyPart}
              onChangeText={setBodyPart}
              placeholder="Enter custom body part"
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
            Description (Optional)
          </Text>
          <TextArea
            value={description}
            onChangeText={setDescription}
            placeholder="Add a description or notes about this exercise"
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
            Cancel
          </Button>
          <Button
            flex={1}
            backgroundColor="$primaryButton"
            color={colors.white}
            onPress={handleCreate}
            disabled={isCreating}
            opacity={isCreating ? 0.6 : 1}
          >
            {isCreating ? 'Creating...' : 'Create Exercise'}
          </Button>
        </XStack>
      </YStack>
    </ScrollView>
  );
}
