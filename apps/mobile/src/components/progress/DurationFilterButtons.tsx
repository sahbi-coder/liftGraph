import React from 'react';
import { XStack, Button } from 'tamagui';
import { colors } from '@/theme/colors';

export type FilterType = 'week' | 'month' | '3months' | '6months' | 'year' | 'all' | 'custom';

interface DurationFilterButtonsProps {
  filterType: FilterType;
  onFilterChange: (type: FilterType) => void;
  onCustomRangePress: () => void;
  availableFilters?: FilterType[];
}

const defaultFilters: FilterType[] = ['month', '3months', '6months', 'year', 'all', 'custom'];

const filterLabels: Record<FilterType, string> = {
  week: 'Last Week',
  month: 'Last Month',
  '3months': '3 Months',
  '6months': '6 Months',
  year: 'Last Year',
  all: 'All Time',
  custom: 'Custom Range',
};

export function DurationFilterButtons({
  filterType,
  onFilterChange,
  onCustomRangePress,
  availableFilters = defaultFilters,
}: DurationFilterButtonsProps) {
  const handleFilterPress = (type: FilterType) => {
    if (type === 'custom') {
      onCustomRangePress();
    } else {
      onFilterChange(type);
    }
  };

  return (
    <XStack gap="$2" flexWrap="wrap" marginBottom="$3">
      {availableFilters.map((filter) => (
        <Button
          key={filter}
          size="$3"
          backgroundColor={filterType === filter ? colors.niceOrange : colors.darkGray}
          color={colors.white}
          fontSize="$3"
          borderRadius="$3"
          paddingHorizontal="$3"
          paddingVertical="$2"
          onPress={() => handleFilterPress(filter)}
        >
          {filterLabels[filter]}
        </Button>
      ))}
    </XStack>
  );
}
