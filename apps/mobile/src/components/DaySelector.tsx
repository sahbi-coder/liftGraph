import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { XStack, Text } from 'tamagui';
import { colors } from '@/theme/colors';

export type ProgramDay = 'Day1' | 'Day2' | 'Day3' | 'Day4' | 'Day5' | 'Day6' | 'Day7';

export interface DaySelectorProps {
  value?: ProgramDay[];
  onSelectionChange?: (selectedDays: ProgramDay[]) => void;
}

const DAYS: ProgramDay[] = ['Day1', 'Day2', 'Day3', 'Day4', 'Day5', 'Day6', 'Day7'];

export function DaySelector({ value, onSelectionChange }: DaySelectorProps) {
  const [internalSelectedDays, setInternalSelectedDays] = useState<ProgramDay[]>([]);
  const selectedDays = value !== undefined ? value : internalSelectedDays;

  const handleDayPress = (day: ProgramDay) => {
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
            style={{
              backgroundColor: isSelected ? colors.niceOrange : colors.darkGray,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 8,
              minWidth: 50,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text color={colors.white} fontSize="$3" fontWeight={isSelected ? '600' : '400'}>
              {day}
            </Text>
          </Pressable>
        );
      })}
    </XStack>
  );
}
