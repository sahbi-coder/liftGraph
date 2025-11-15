import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, ListRenderItem } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input, Text, XStack, YStack } from 'tamagui';

import { useDependencies } from '@/dependencies/provider';
import { useAuth } from '@/contexts/AuthContext';
import { Exercise } from '@/services/firestore';
import { colors } from '@/theme/colors';
import { ExerciseSelection } from '@/app/(tabs)/workout/types';
import {
  getExercisePickerCallback,
  clearExercisePickerCallback,
} from '@/app/(tabs)/workout/exercisePickerContext';

export default function ProgramExercisePickerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { services } = useDependencies();

  const [search, setSearch] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filter, setFilter] = useState<'all' | 'library' | 'custom'>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    services.firestore
      .getExercisesWithLibrary(user.uid)
      .then((result) => {
        if (isMounted) {
          setExercises(result);
        }
      })
      .catch((error) => {
        console.error('Failed to load exercises', error);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [services.firestore, user]);

  const filteredExercises = useMemo(() => {
    const query = search.trim().toLowerCase();
    return exercises.filter((exercise) => {
      const matchesSearch = !query || exercise.name.toLowerCase().includes(query);
      const matchesFilter =
        filter === 'all' ||
        (filter === 'library' && exercise.source === 'library') ||
        (filter === 'custom' && exercise.source === 'user');
      return matchesSearch && matchesFilter;
    });
  }, [exercises, filter, search]);

  const handleSelect = useCallback(
    (exercise: ExerciseSelection) => {
      // Get fresh callback and context from the context module
      const contextCallback = getExercisePickerCallback();
      const effectiveOnSelect = contextCallback.callback;
      const effectiveContext = contextCallback.context;

      console.log('Exercise selected:', exercise);
      console.log('Callback exists:', !!effectiveOnSelect);
      console.log('Context:', effectiveContext);

      if (effectiveOnSelect) {
        try {
          effectiveOnSelect(exercise, effectiveContext || undefined);
          console.log('Callback executed successfully');
        } catch (error) {
          console.error('Error executing callback:', error);
        }
        clearExercisePickerCallback();
        // Always use router.back() to return to the previous screen
        // This ensures we return to the same instance, not a new one
        router.back();
      } else {
        console.log(
          'No callback found. Selected exercise:',
          exercise.id,
          exercise.name,
          exercise.source,
        );
        router.back();
      }
    },
    [router],
  );

  const renderItem: ListRenderItem<Exercise> = useCallback(
    ({ item }) => (
      <Button
        key={item.id}
        justifyContent="flex-start"
        backgroundColor={colors.midGray}
        color={colors.white}
        marginBottom="$2"
        onPress={() =>
          handleSelect({
            id: item.id,
            name: item.name,
            source: item.source,
          })
        }
      >
        <YStack>
          <Text color={colors.white} fontWeight="600">
            {item.name}
          </Text>
        </YStack>
      </Button>
    ),
    [handleSelect],
  );

  const keyExtractor = useCallback((item: Exercise) => item.id, []);

  return (
    <YStack flex={1} backgroundColor={colors.darkerGray} padding="$4" space="$4">
      <XStack space="$3" alignItems="center">
        <Input
          flex={1}
          height={40}
          value={search}
          onChangeText={setSearch}
          placeholder="Search exercises"
          autoCapitalize="none"
          autoCorrect={false}
          borderColor="$inputFieldBorder"
          backgroundColor="$inputFieldBackground"
          placeholderTextColor="$inputFieldPlaceholderText"
          color="$inputFieldText"
        />
        <Button
          size="$3"
          height={40}
          backgroundColor="$primaryButton"
          color={colors.white}
          onPress={() => setSearch('')}
          disabled={!search}
        >
          Clear
        </Button>
      </XStack>

      <XStack space="$2" justifyContent="center">
        <Button
          flex={1}
          size="$3"
          height={36}
          backgroundColor={filter === 'all' ? '$primaryButton' : colors.midGray}
          color={colors.white}
          onPress={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          flex={1}
          size="$3"
          height={36}
          backgroundColor={filter === 'library' ? '$primaryButton' : colors.midGray}
          color={colors.white}
          onPress={() => setFilter('library')}
        >
          Library
        </Button>
        <Button
          flex={1}
          size="$3"
          height={36}
          backgroundColor={filter === 'custom' ? '$primaryButton' : colors.midGray}
          color={colors.white}
          onPress={() => setFilter('custom')}
        >
          Custom
        </Button>
      </XStack>

      {isLoading ? (
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text color={colors.white}>Loading exercises...</Text>
        </YStack>
      ) : (
        <FlatList
          data={filteredExercises}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: 32,
          }}
        />
      )}

      <Button
        backgroundColor={colors.midGray}
        color={colors.white}
        onPress={() => {
          clearExercisePickerCallback();
          router.back();
        }}
      >
        Cancel
      </Button>
    </YStack>
  );
}
