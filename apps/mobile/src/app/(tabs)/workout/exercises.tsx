import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, ListRenderItem } from 'react-native';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Button, Input, Text, XStack, YStack } from 'tamagui';

import { useDependencies } from '@/dependencies/provider';
import { useAuth } from '@/contexts/AuthContext';
import { Exercise } from '@/services/firestore';
import { colors } from '@/theme/colors';

type ExerciseSelection = {
  id: string;
  name: string;
  source: 'library' | 'user';
};

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
  const [isLoading, setIsLoading] = useState(false);
  const onSelect = route.params?.onSelect;

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
    if (!search.trim()) {
      return exercises;
    }

    const query = search.trim().toLowerCase();
    return exercises.filter((exercise) => exercise.name.toLowerCase().includes(query));
  }, [exercises, search]);

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
          <Text color={colors.niceOrange} fontSize="$2">
            Source: {item.source === 'library' ? 'Library' : 'My Exercises'}
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
          variant="outlined"
          color={colors.white}
          onPress={() => setSearch('')}
          disabled={!search}
        >
          Clear
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
        onPress={() => navigation.goBack()}
      >
        Cancel
      </Button>
    </YStack>
  );
}
