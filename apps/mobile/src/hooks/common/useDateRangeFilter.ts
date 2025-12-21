import { useCallback, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import type { Workout } from '@/services';
import type { FilterType } from '@/components/progress/DurationFilterButtons';

export interface UseDateRangeFilterOptions {
  workouts?: Workout[];
  defaultFilter?: FilterType;
  // For screens that use series data instead of workouts for "all" filter
  seriesData?: { date: Date }[];
}

export interface DateRangeFilterResult {
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
  customStartDate: string | null;
  customEndDate: string | null;
  setCustomStartDate: (date: string | null) => void;
  setCustomEndDate: (date: string | null) => void;
  isCustomRangeModalVisible: boolean;
  setIsCustomRangeModalVisible: (visible: boolean) => void;
  dateRange: { startDate: dayjs.Dayjs; endDate: dayjs.Dayjs };
  dateRangeDisplay: string;
  overallRange: { minDate: dayjs.Dayjs; maxDate: dayjs.Dayjs };
  handleQuickFilter: (type: FilterType) => void;
  handleOpenCustomRange: () => void;
  handleApplyCustomRange: (startDate: string, endDate: string) => void;
}

/**
 * Custom hook that consolidates date range filtering logic for progress charts.
 * Handles filter type state, custom date ranges, and date range calculations.
 */
export function useDateRangeFilter({
  workouts = [],
  defaultFilter = 'month',
  seriesData,
}: UseDateRangeFilterOptions = {}): DateRangeFilterResult {
  const [filterType, setFilterType] = useState<FilterType>(defaultFilter);
  const [customStartDate, setCustomStartDate] = useState<string | null>(null);
  const [customEndDate, setCustomEndDate] = useState<string | null>(null);
  const [isCustomRangeModalVisible, setIsCustomRangeModalVisible] = useState(false);

  // Compute overall date range from workouts
  const overallRange = useMemo(() => {
    if (!workouts.length) {
      const today = dayjs();
      return {
        minDate: today.subtract(3, 'month'),
        maxDate: today,
      };
    }

    let minDate = dayjs(workouts[0].date);
    let maxDate = dayjs(workouts[0].date);

    workouts.forEach((w) => {
      const d = dayjs(w.date);
      if (d.isBefore(minDate)) minDate = d;
      if (d.isAfter(maxDate)) maxDate = d;
    });

    return { minDate, maxDate };
  }, [workouts]);

  // Calculate date range based on filter type
  const dateRange = useMemo(() => {
    const today = dayjs();
    let startDate: dayjs.Dayjs;
    let endDate: dayjs.Dayjs;

    if (filterType === 'custom') {
      if (customStartDate && customEndDate) {
        startDate = dayjs(customStartDate);
        endDate = dayjs(customEndDate);
      } else {
        // Default to last 3 months if custom not set
        endDate = today;
        startDate = endDate.subtract(3, 'month');
      }
    } else {
      switch (filterType) {
        case 'week':
          endDate = today;
          startDate = endDate.subtract(1, 'week');
          break;
        case 'month':
          endDate = today;
          startDate = endDate.subtract(1, 'month');
          break;
        case '3months':
          endDate = today;
          startDate = endDate.subtract(3, 'month');
          break;
        case '6months':
          endDate = today;
          startDate = endDate.subtract(6, 'month');
          break;
        case 'year':
          endDate = today;
          startDate = endDate.subtract(1, 'year');
          break;
        case 'all':
        default:
          // Use series data if available (for top-set and estimated-1rm), otherwise use overallRange
          if (seriesData && seriesData.length > 0) {
            startDate = dayjs(seriesData[0].date);
            endDate = today;
          } else {
            startDate = overallRange.minDate;
            endDate = overallRange.maxDate;
          }
          break;
      }
    }

    return { startDate, endDate };
  }, [filterType, customStartDate, customEndDate, overallRange, seriesData]);

  // Format date range display
  const dateRangeDisplay = useMemo(() => {
    if (filterType === 'custom' && customStartDate && customEndDate) {
      return `${dayjs(customStartDate).format('MMM D, YYYY')} - ${dayjs(customEndDate).format(
        'MMM D, YYYY',
      )}`;
    }
    return `${dateRange.startDate.format('MMM D, YYYY')} - ${dateRange.endDate.format(
      'MMM D, YYYY',
    )}`;
  }, [filterType, customStartDate, customEndDate, dateRange]);

  const handleQuickFilter = useCallback((type: FilterType) => {
    setFilterType(type);
    setCustomStartDate(null);
    setCustomEndDate(null);
  }, []);

  const handleOpenCustomRange = useCallback(() => {
    setIsCustomRangeModalVisible(true);
  }, []);

  const handleApplyCustomRange = useCallback((startDate: string, endDate: string) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    setFilterType('custom');
  }, []);

  return {
    filterType,
    setFilterType,
    customStartDate,
    customEndDate,
    setCustomStartDate,
    setCustomEndDate,
    isCustomRangeModalVisible,
    setIsCustomRangeModalVisible,
    dateRange,
    dateRangeDisplay,
    overallRange,
    handleQuickFilter,
    handleOpenCustomRange,
    handleApplyCustomRange,
  };
}
