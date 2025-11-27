import React from 'react';
import { ScrollView, Pressable } from 'react-native';
import { YStack, Text, Button, XStack } from 'tamagui';
import Entypo from '@expo/vector-icons/Entypo';

import { colors } from '@/theme/colors';
import type { Program } from '@/services/firestore';

type ProgramHomeScreenProps = {
  programs: Program[];
  onCreateProgram: () => void;
  onProgramPress: (programId: string) => void;
};

export function ProgramHomeScreen({
  programs,
  onCreateProgram,
  onProgramPress,
}: ProgramHomeScreenProps) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.darkerGray }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
    >
      <YStack space="$2" alignItems="flex-start">
        <Text color="$textSecondary" fontSize="$5">
          Manage your training programs
        </Text>
      </YStack>

      {programs.length === 0 ? (
        <YStack
          padding="$4"
          backgroundColor={colors.midGray}
          borderRadius="$4"
          alignItems="center"
          space="$2"
        >
          <Text color="$textSecondary" fontSize="$4" textAlign="center">
            No programs yet. Create your first program to get started!
          </Text>
        </YStack>
      ) : (
        <YStack space="$3">
          {programs.map((program) => (
            <Pressable key={program.id} onPress={() => onProgramPress(program.id)}>
              <YStack padding="$3" backgroundColor={colors.midGray} borderRadius="$4" space="$2">
                <XStack alignItems="center" justifyContent="space-between">
                  <YStack flex={1} space="$1">
                    <Text color="$textPrimary" fontSize="$5" fontWeight="600">
                      {program.name}
                    </Text>
                    <Text color="$textSecondary" fontSize="$3" numberOfLines={2}>
                      {program.description}
                    </Text>
                    <Text color="$textSecondary" fontSize="$2">
                      {program.type === 'simple'
                        ? 'Simple'
                        : program.type === 'alternating'
                          ? 'Alternating'
                          : 'Advanced'}{' '}
                      Program
                    </Text>
                  </YStack>
                  <Entypo name="chevron-right" size={24} color={colors.niceOrange} />
                </XStack>
              </YStack>
            </Pressable>
          ))}
        </YStack>
      )}

      <Button
        size="$5"
        backgroundColor="$secondaryButton"
        color="$secondaryButtonText"
        fontWeight="600"
        borderRadius="$4"
        onPress={onCreateProgram}
        pressStyle={{ opacity: 0.85 }}
        alignSelf="stretch"
      >
        Create Program
      </Button>
    </ScrollView>
  );
}
