import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { XStack, Text } from 'tamagui';
import { colors } from '@/theme/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { ProgramDayLabel } from '@/services';

export interface DaySelectorProps {
  value?: ProgramDayLabel[];
  onSelectionChange?: (selectedDays: ProgramDayLabel[]) => void;
  disabled?: boolean;
}

const DAYS: ProgramDayLabel[] = ['Day1', 'Day2', 'Day3', 'Day4', 'Day5', 'Day6', 'Day7'];

export function DaySelector({ value, onSelectionChange, disabled = false }: DaySelectorProps) {
  const { t } = useTranslation();
  const [internalSelectedDays, setInternalSelectedDays] = useState<ProgramDayLabel[]>([]);
  const selectedDays = value !== undefined ? value : internalSelectedDays;

  const getDayLabel = (day: ProgramDayLabel): string => {
    const dayNumber = day.replace('Day', '');
    return t('common.day') + ' ' + dayNumber;
  };

  const handleDayPress = (day: ProgramDayLabel) => {
    if (disabled) {
      return;
    }

    const newSelection = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];

    if (value === undefined) {
      setInternalSelectedDays(newSelection);
    }
    onSelectionChange?.(newSelection);
  };

  return (
    <XStack gap="$2" flexWrap="wrap">
      {DAYS.map((day) => {
        const isSelected = selectedDays.includes(day);
        return (
          <Pressable
            key={day}
            onPress={() => handleDayPress(day)}
            disabled={disabled}
            style={{
              backgroundColor: isSelected ? colors.niceOrange : colors.darkGray,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 8,
              minWidth: 50,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: disabled ? 1 : 1,
            }}
          >
            <Text color={colors.white} fontSize="$3" fontWeight={isSelected ? '600' : '400'}>
              {getDayLabel(day)}
            </Text>
          </Pressable>
        );
      })}
    </XStack>
  );
}
