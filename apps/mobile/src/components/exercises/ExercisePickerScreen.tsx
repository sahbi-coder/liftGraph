import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItem, View, StyleSheet } from 'react-native';
import { Button, Input, Text, XStack, YStack } from 'tamagui';
import Entypo from '@expo/vector-icons/Entypo';

import { colors } from '@/theme/colors';
import type { Exercise } from '@/services';
import type { ExerciseSelection } from '@/types/workout';
import { useTranslation } from '@/hooks/useTranslation';

type ExercisePickerScreenProps = {
  exercises: Exercise[];
  isLoading: boolean;
  onSelect: (exercise: ExerciseSelection) => void;
  onCancel: () => void;
  onCreateExercise?: () => void;
  showCreateButton?: boolean;
  showCancelButton?: boolean;
  title?: string;
};

export function ExercisePickerScreen({
  exercises,
  isLoading,
  onSelect,
  onCancel,
  onCreateExercise,
  showCreateButton = true,
  showCancelButton = true,
  title,
}: ExercisePickerScreenProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filteredExercises = useMemo(() => {
    const query = search.trim().toLowerCase();
    return exercises.filter((exercise) => {
      const matchesSearch = !query || exercise.name.toLowerCase().includes(query);
      return matchesSearch;
    });
  }, [exercises, search]);

  const handleSelect = useCallback(
    (exercise: Exercise) => {
      onSelect({
        id: exercise.id,
        name: exercise.name,
      });
    },
    [onSelect],
  );

  const renderItem: ListRenderItem<Exercise> = useCallback(
    ({ item }) => (
      <Button
        key={item.id}
        justifyContent="flex-start"
        backgroundColor={colors.midGray}
        color={colors.white}
        marginBottom="$2"
        onPress={() => handleSelect(item)}
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
      {title && (
        <Text color={colors.white} fontSize="$6" fontWeight="600">
          {title}
        </Text>
      )}

      <XStack space="$3" alignItems="center">
        <Input
          flex={1}
          height={40}
          value={search}
          onChangeText={setSearch}
          placeholder={t('exercise.searchExercises')}
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
          <Text color={colors.white}>{t('common.clear')}</Text>
        </Button>
      </XStack>

      {isLoading ? (
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text color={colors.white}>{t('exercise.loadingExercises')}</Text>
        </YStack>
      ) : filteredExercises.length === 0 ? (
        <YStack flex={1} justifyContent="center" alignItems="center" space="$4" padding="$4">
          <Entypo name="info" size={48} color={colors.niceOrange} />
          <Text color="$textPrimary" fontSize="$5" fontWeight="600" textAlign="center">
            {search.trim() ? t('exercise.noExercisesFound') : t('exercise.noExercisesYet')}
          </Text>
          <Text color="$textSecondary" fontSize="$4" textAlign="center">
            {search.trim()
              ? t('exercise.tryAdjustingSearch')
              : t('exercise.createFirstCustomExercise')}
          </Text>
          {showCreateButton && onCreateExercise && (
            <Button
              backgroundColor="$primaryButton"
              color={colors.white}
              onPress={onCreateExercise}
              borderRadius="$4"
              paddingHorizontal="$4"
              paddingVertical="$3"
            >
              <Entypo name="circle-with-plus" size={20} color={colors.white} />
              <Text color={colors.white} marginLeft="$2">
                {t('exercise.create')}
              </Text>
            </Button>
          )}
        </YStack>
      ) : (
        <FlatList
          data={filteredExercises}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: showCreateButton ? 100 : 32, // Extra padding for FAB if shown
          }}
        />
      )}

      {showCancelButton && (
        <Button backgroundColor={colors.midGray} color={colors.white} onPress={onCancel}>
          {t('common.cancel')}
        </Button>
      )}

      {/* Floating Action Button */}
      {showCreateButton && onCreateExercise && (
        <View style={styles.fabContainer}>
          <Button
            size="$5"
            circular
            backgroundColor="$primaryButton"
            color={colors.white}
            onPress={onCreateExercise}
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.25}
            shadowRadius={3.84}
            elevation={5}
          >
            <Entypo name="plus" size={28} color={colors.white} />
          </Button>
        </View>
      )}
    </YStack>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    zIndex: 10,
  },
});
