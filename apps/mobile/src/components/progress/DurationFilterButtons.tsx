import React from 'react';
import { XStack, Button } from 'tamagui';
import { colors } from '@/theme/colors';
import { useTranslation } from '@/hooks/useTranslation';

export type FilterType = 'week' | 'month' | '3months' | '6months' | 'year' | 'all' | 'custom';

interface DurationFilterButtonsProps {
  filterType: FilterType;
  onFilterChange: (type: FilterType) => void;
  onCustomRangePress: () => void;
  availableFilters?: FilterType[];
}

const defaultFilters: FilterType[] = ['month', '3months', '6months', 'year', 'all', 'custom'];

export function DurationFilterButtons({
  filterType,
  onFilterChange,
  onCustomRangePress,
  availableFilters = defaultFilters,
}: DurationFilterButtonsProps) {
  const { t } = useTranslation();

  const filterLabels: Record<FilterType, string> = {
    week: t('progress.lastWeek'),
    month: t('progress.lastMonth'),
    '3months': t('progress.3Months'),
    '6months': t('progress.6Months'),
    year: t('progress.lastYear'),
    all: t('progress.allTime'),
    custom: t('progress.customRange'),
  };
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
