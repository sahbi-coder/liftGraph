import { renderHook, act } from '@testing-library/react-native';
import dayjs from 'dayjs';
import { useDateRangeFilter } from './useDateRangeFilter';
import type { Workout } from '@/services';

describe('useDateRangeFilter', () => {
  const createMockWorkout = (date: string): Workout => ({
    id: `workout-${date}`,
    date: new Date(date),
    validated: true,
    exercises: [],
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  describe('initialization', () => {
    it('should initialize with default filter type', () => {
      const { result } = renderHook(() => useDateRangeFilter());

      expect(result.current.filterType).toBe('month');
      expect(result.current.customStartDate).toBeNull();
      expect(result.current.customEndDate).toBeNull();
      expect(result.current.isCustomRangeModalVisible).toBe(false);
    });

    it('should initialize with custom default filter type', () => {
      const { result } = renderHook(() => useDateRangeFilter({ defaultFilter: 'week' }));

      expect(result.current.filterType).toBe('week');
    });

    it('should calculate overall range from workouts', () => {
      const workouts = [
        createMockWorkout('2024-01-15'),
        createMockWorkout('2024-02-20'),
        createMockWorkout('2024-03-10'),
      ];

      const { result } = renderHook(() => useDateRangeFilter({ workouts }));

      expect(result.current.overallRange.minDate.format('YYYY-MM-DD')).toBe('2024-01-15');
      expect(result.current.overallRange.maxDate.format('YYYY-MM-DD')).toBe('2024-03-10');
    });

    it('should use default range when no workouts provided', () => {
      const { result } = renderHook(() => useDateRangeFilter({ workouts: [] }));

      const today = dayjs();
      const expectedMin = today.subtract(3, 'month');

      expect(result.current.overallRange.minDate.format('YYYY-MM')).toBe(
        expectedMin.format('YYYY-MM'),
      );
      expect(result.current.overallRange.maxDate.format('YYYY-MM')).toBe(today.format('YYYY-MM'));
    });
  });

  describe('date range calculations', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-06-15'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should calculate week range correctly', () => {
      const { result } = renderHook(() => useDateRangeFilter({ defaultFilter: 'week' }));

      const expectedStart = dayjs('2024-06-15').subtract(1, 'week');
      const expectedEnd = dayjs('2024-06-15');

      expect(result.current.dateRange.startDate.format('YYYY-MM-DD')).toBe(
        expectedStart.format('YYYY-MM-DD'),
      );
      expect(result.current.dateRange.endDate.format('YYYY-MM-DD')).toBe(
        expectedEnd.format('YYYY-MM-DD'),
      );
    });

    it('should calculate month range correctly', () => {
      const { result } = renderHook(() => useDateRangeFilter({ defaultFilter: 'month' }));

      const expectedStart = dayjs('2024-06-15').subtract(1, 'month');
      const expectedEnd = dayjs('2024-06-15');

      expect(result.current.dateRange.startDate.format('YYYY-MM-DD')).toBe(
        expectedStart.format('YYYY-MM-DD'),
      );
      expect(result.current.dateRange.endDate.format('YYYY-MM-DD')).toBe(
        expectedEnd.format('YYYY-MM-DD'),
      );
    });

    it('should calculate 3months range correctly', () => {
      const { result } = renderHook(() => useDateRangeFilter({ defaultFilter: '3months' }));

      const expectedStart = dayjs('2024-06-15').subtract(3, 'month');
      const expectedEnd = dayjs('2024-06-15');

      expect(result.current.dateRange.startDate.format('YYYY-MM-DD')).toBe(
        expectedStart.format('YYYY-MM-DD'),
      );
      expect(result.current.dateRange.endDate.format('YYYY-MM-DD')).toBe(
        expectedEnd.format('YYYY-MM-DD'),
      );
    });

    it('should calculate 6months range correctly', () => {
      const { result } = renderHook(() => useDateRangeFilter({ defaultFilter: '6months' }));

      const expectedStart = dayjs('2024-06-15').subtract(6, 'month');
      const expectedEnd = dayjs('2024-06-15');

      expect(result.current.dateRange.startDate.format('YYYY-MM-DD')).toBe(
        expectedStart.format('YYYY-MM-DD'),
      );
      expect(result.current.dateRange.endDate.format('YYYY-MM-DD')).toBe(
        expectedEnd.format('YYYY-MM-DD'),
      );
    });

    it('should calculate year range correctly', () => {
      const { result } = renderHook(() => useDateRangeFilter({ defaultFilter: 'year' }));

      const expectedStart = dayjs('2024-06-15').subtract(1, 'year');
      const expectedEnd = dayjs('2024-06-15');

      expect(result.current.dateRange.startDate.format('YYYY-MM-DD')).toBe(
        expectedStart.format('YYYY-MM-DD'),
      );
      expect(result.current.dateRange.endDate.format('YYYY-MM-DD')).toBe(
        expectedEnd.format('YYYY-MM-DD'),
      );
    });

    it('should calculate all range from workouts when no series data', () => {
      const workouts = [createMockWorkout('2024-01-15'), createMockWorkout('2024-03-10')];

      const { result } = renderHook(() => useDateRangeFilter({ workouts, defaultFilter: 'all' }));

      expect(result.current.dateRange.startDate.format('YYYY-MM-DD')).toBe('2024-01-15');
      expect(result.current.dateRange.endDate.format('YYYY-MM-DD')).toBe('2024-03-10');
    });

    it('should calculate all range from series data when available', () => {
      const seriesData = [
        { date: new Date('2024-01-10') },
        { date: new Date('2024-02-20') },
        { date: new Date('2024-03-30') },
      ];

      const { result } = renderHook(() => useDateRangeFilter({ defaultFilter: 'all', seriesData }));

      expect(result.current.dateRange.startDate.format('YYYY-MM-DD')).toBe('2024-01-10');
      expect(result.current.dateRange.endDate.format('YYYY-MM-DD')).toBe('2024-06-15');
    });

    it('should use custom date range when filter type is custom', () => {
      const { result } = renderHook(() => useDateRangeFilter());

      act(() => {
        result.current.setCustomStartDate('2024-05-01');
        result.current.setCustomEndDate('2024-05-31');
        result.current.setFilterType('custom');
      });

      expect(result.current.dateRange.startDate.format('YYYY-MM-DD')).toBe('2024-05-01');
      expect(result.current.dateRange.endDate.format('YYYY-MM-DD')).toBe('2024-05-31');
    });

    it('should default to last 3 months when custom filter is selected but dates not set', () => {
      const { result } = renderHook(() => useDateRangeFilter());

      act(() => {
        result.current.setFilterType('custom');
      });

      const expectedStart = dayjs('2024-06-15').subtract(3, 'month');
      const expectedEnd = dayjs('2024-06-15');

      expect(result.current.dateRange.startDate.format('YYYY-MM-DD')).toBe(
        expectedStart.format('YYYY-MM-DD'),
      );
      expect(result.current.dateRange.endDate.format('YYYY-MM-DD')).toBe(
        expectedEnd.format('YYYY-MM-DD'),
      );
    });
  });

  describe('date range display', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-06-15'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should format date range display correctly', () => {
      const { result } = renderHook(() => useDateRangeFilter({ defaultFilter: 'month' }));

      const display = result.current.dateRangeDisplay;
      expect(display).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4} - [A-Z][a-z]{2} \d{1,2}, \d{4}$/);
    });

    it('should format custom date range display correctly', () => {
      const { result } = renderHook(() => useDateRangeFilter());

      act(() => {
        result.current.setCustomStartDate('2024-05-01');
        result.current.setCustomEndDate('2024-05-31');
        result.current.setFilterType('custom');
      });

      expect(result.current.dateRangeDisplay).toBe('May 1, 2024 - May 31, 2024');
    });
  });

  describe('filter handlers', () => {
    it('should handle quick filter change', () => {
      const { result } = renderHook(() => useDateRangeFilter());

      act(() => {
        result.current.setCustomStartDate('2024-05-01');
        result.current.setCustomEndDate('2024-05-31');
        result.current.setFilterType('custom');
      });

      expect(result.current.filterType).toBe('custom');
      expect(result.current.customStartDate).toBe('2024-05-01');

      act(() => {
        result.current.handleQuickFilter('week');
      });

      expect(result.current.filterType).toBe('week');
      expect(result.current.customStartDate).toBeNull();
      expect(result.current.customEndDate).toBeNull();
    });

    it('should open custom range modal', () => {
      const { result } = renderHook(() => useDateRangeFilter());

      expect(result.current.isCustomRangeModalVisible).toBe(false);

      act(() => {
        result.current.handleOpenCustomRange();
      });

      expect(result.current.isCustomRangeModalVisible).toBe(true);
    });

    it('should apply custom range and set filter type to custom', () => {
      const { result } = renderHook(() => useDateRangeFilter());

      act(() => {
        result.current.handleApplyCustomRange('2024-05-01', '2024-05-31');
      });

      expect(result.current.customStartDate).toBe('2024-05-01');
      expect(result.current.customEndDate).toBe('2024-05-31');
      expect(result.current.filterType).toBe('custom');
    });
  });

  describe('state setters', () => {
    it('should update filter type', () => {
      const { result } = renderHook(() => useDateRangeFilter());

      act(() => {
        result.current.setFilterType('year');
      });

      expect(result.current.filterType).toBe('year');
    });

    it('should update custom start date', () => {
      const { result } = renderHook(() => useDateRangeFilter());

      act(() => {
        result.current.setCustomStartDate('2024-05-01');
      });

      expect(result.current.customStartDate).toBe('2024-05-01');
    });

    it('should update custom end date', () => {
      const { result } = renderHook(() => useDateRangeFilter());

      act(() => {
        result.current.setCustomEndDate('2024-05-31');
      });

      expect(result.current.customEndDate).toBe('2024-05-31');
    });

    it('should update custom range modal visibility', () => {
      const { result } = renderHook(() => useDateRangeFilter());

      act(() => {
        result.current.setIsCustomRangeModalVisible(true);
      });

      expect(result.current.isCustomRangeModalVisible).toBe(true);

      act(() => {
        result.current.setIsCustomRangeModalVisible(false);
      });

      expect(result.current.isCustomRangeModalVisible).toBe(false);
    });
  });
});
