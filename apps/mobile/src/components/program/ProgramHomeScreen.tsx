import React from 'react';
import { ScrollView, Pressable } from 'react-native';
import { YStack, Text, Button, XStack } from 'tamagui';
import Entypo from '@expo/vector-icons/Entypo';

import { colors } from '@/theme/colors';
import type { Program } from '@/services';
import { useTranslation } from '@/hooks/common/useTranslation';

type ProgramHomeScreenProps = {
  customPrograms: Program[];
  defaultPrograms: Program[];
  onCreateProgram: () => void;
  onProgramPress: (programId: string) => void;
};

const ProgramList = ({
  programs,
  onProgramPress,
}: {
  programs: Program[];
  onProgramPress: (programId: string) => void;
}) => {
  const { t } = useTranslation();
  if (programs.length === 0) {
    return null;
  }

  return (
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
                    ? t('program.simpleProgram')
                    : program.type === 'alternating'
                      ? t('program.alternatingProgram')
                      : t('program.advancedProgram')}
                </Text>
              </YStack>
              <Entypo name="chevron-right" size={24} color={colors.niceOrange} />
            </XStack>
          </YStack>
        </Pressable>
      ))}
    </YStack>
  );
};

export function ProgramHomeScreen({
  customPrograms,
  defaultPrograms,
  onCreateProgram,
  onProgramPress,
}: ProgramHomeScreenProps) {
  const { t } = useTranslation();
  const hasAnyPrograms = customPrograms.length > 0 || defaultPrograms.length > 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.darkerGray }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
    >
      <YStack space="$2" alignItems="flex-start">
        <Text color="$textSecondary" fontSize="$5">
          {t('program.manageYourTrainingPrograms')}
        </Text>
      </YStack>

      {!hasAnyPrograms ? (
        <YStack
          padding="$4"
          backgroundColor={colors.midGray}
          borderRadius="$4"
          alignItems="center"
          space="$2"
        >
          <Text color="$textSecondary" fontSize="$4" textAlign="center">
            {t('program.noProgramsYet')}
          </Text>
        </YStack>
      ) : (
        <YStack space="$4">
          {customPrograms.length > 0 && (
            <YStack space="$2">
              <Text color="$textPrimary" fontSize="$6" fontWeight="600">
                {t('program.myPrograms')}
              </Text>
              <ProgramList programs={customPrograms} onProgramPress={onProgramPress} />
            </YStack>
          )}

          {defaultPrograms.length > 0 && (
            <YStack space="$2">
              <Text color="$textPrimary" fontSize="$6" fontWeight="600">
                {t('program.defaultPrograms')}
              </Text>
              <ProgramList programs={defaultPrograms} onProgramPress={onProgramPress} />
            </YStack>
          )}
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
        {t('program.create')}
      </Button>
    </ScrollView>
  );
}
