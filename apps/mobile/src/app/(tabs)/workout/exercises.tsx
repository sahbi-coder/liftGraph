import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, ListRenderItem, View, StyleSheet } from 'react-native';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Button, Input, Text, XStack, YStack } from 'tamagui';
import Entypo from '@expo/vector-icons/Entypo';

import { useDependencies } from '@/dependencies/provider';
import { useAuth } from '@/contexts/AuthContext';
import { Exercise } from '@/services/firestore';
import { colors } from '@/theme/colors';
import { ExerciseSelection } from './types';

type ExercisePickerParams = {
  onSelect?: (exercise: ExerciseSelection) => void;
};

type WorkoutStackParamList = {
  index: undefined;
  create: undefined;
  exercises: ExercisePickerParams;
};

type RouteParams = RouteProp<WorkoutStackParamList, 'exercises'>;

export default function ExercisePickerScreen() {
  const navigation = useNavigation<NavigationProp<WorkoutStackParamList>>();
  const router = useRouter();
  const route = useRoute<RouteParams>();
  const { user } = useAuth();
  const { services } = useDependencies();

  const [search, setSearch] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filter, setFilter] = useState<'all' | 'library' | 'custom'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const onSelect = route.params?.onSelect;

  const loadExercises = useCallback(() => {
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

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  // Reload exercises when screen comes into focus (e.g., after creating a new exercise)
  useFocusEffect(
    useCallback(() => {
      loadExercises();
    }, [loadExercises]),
  );

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
      if (onSelect) {
        onSelect(exercise);
      } else {
        console.log('Selected exercise:', exercise.id, exercise.name, exercise.source);
      }
      router.back();
    },
    [onSelect, router],
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
      ) : filteredExercises.length === 0 ? (
        <YStack flex={1} justifyContent="center" alignItems="center" space="$4" padding="$4">
          <Entypo name="info" size={48} color={colors.niceOrange} />
          <Text color="$textPrimary" fontSize="$5" fontWeight="600" textAlign="center">
            {search.trim() || filter !== 'all' ? 'No exercises found' : 'No exercises yet'}
          </Text>
          <Text color="$textSecondary" fontSize="$4" textAlign="center">
            {search.trim() || filter !== 'all'
              ? 'Try adjusting your search or filters, or create a new exercise.'
              : 'Create your first custom exercise to get started!'}
          </Text>
          <Button
            backgroundColor="$primaryButton"
            color={colors.white}
            onPress={() => router.push('/(tabs)/workout/exercise-create')}
            borderRadius="$4"
            paddingHorizontal="$4"
            paddingVertical="$3"
          >
            <Entypo name="circle-with-plus" size={20} color={colors.white} />
            <Text color={colors.white} marginLeft="$2">
              Create Exercise
            </Text>
          </Button>
        </YStack>
      ) : (
        <FlatList
          data={filteredExercises}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: 100, // Extra padding for FAB
          }}
        />
      )}

      <Button
        backgroundColor={colors.midGray}
        color={colors.white}
        onPress={() => navigation.goBack()}
      >
        Cancel
      </Button>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <Button
          size="$5"
          circular
          backgroundColor="$primaryButton"
          color={colors.white}
          onPress={() => router.push('/(tabs)/workout/exercise-create')}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.25}
          shadowRadius={3.84}
          elevation={5}
        >
          <Entypo name="plus" size={28} color={colors.white} />
        </Button>
      </View>
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
