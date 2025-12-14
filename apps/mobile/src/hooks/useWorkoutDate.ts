import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { colors } from '@/theme/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserWorkouts } from '@/hooks/useUserWorkouts';
import type { Workout } from '@/services';

type UseWorkoutDateProps = {
  date: string;
  validated: boolean;
  onValidateWorkout?: () => Promise<void> | void;
};

export const useWorkoutDate = ({ date, validated, onValidateWorkout }: UseWorkoutDateProps) => {
  const { t, i18n } = useTranslation();
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const { workouts } = useUserWorkouts();

  const selectedDateKey = useMemo(() => {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return dayjs(parsedDate).format('YYYY-MM-DD');
  }, [date]);

  const formattedDisplayDate = useMemo(() => {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return t('common.noDateSelected');
    }

    return dayjs(parsedDate).locale(i18n.language).format('MMMM D, YYYY');
  }, [date, t, i18n.language]);

  // Create a map of dates to workouts for quick lookup
  const workoutsByDate = useMemo(() => {
    const map = new Map<string, Workout>();
    workouts?.forEach((workout) => {
      const dateKey = dayjs(workout.date).format('YYYY-MM-DD');
      map.set(dateKey, workout);
    });
    return map;
  }, [workouts]);

  const markedDates = useMemo(() => {
    const marked: Record<
      string,
      { selected: boolean; selectedColor: string; selectedTextColor: string }
    > = {};

    // Mark all workout dates
    workoutsByDate.forEach((workout, dateKey) => {
      marked[dateKey] = {
        selected: true,
        selectedColor: workout.validated ? colors.niceOrange : colors.white,
        selectedTextColor: workout.validated ? colors.white : colors.darkerGray,
      };
    });

    // Mark the selected date (override if it exists, or add if it doesn't)
    if (selectedDateKey) {
      marked[selectedDateKey] = {
        selected: true,
        selectedColor: colors.niceOrange,
        selectedTextColor: colors.darkerGray,
      };
    }

    return marked;
  }, [workoutsByDate, selectedDateKey]);

  // Check if validate button should be shown
  const shouldShowValidateButton = useMemo(() => {
    if (!onValidateWorkout) {
      return false; // Not in edit mode
    }

    if (validated) {
      return false; // Already validated
    }

    const workoutDate = new Date(date);
    if (Number.isNaN(workoutDate.getTime())) {
      return false;
    }

    const isToday = dayjs(workoutDate).isSame(dayjs(), 'day');
    const isBeforeToday = dayjs(workoutDate).isBefore(dayjs(), 'day');

    // Show if date is today or prior
    return isToday || isBeforeToday;
  }, [onValidateWorkout, validated, date]);

  return {
    selectedDateKey,
    formattedDisplayDate,
    markedDates,
    shouldShowValidateButton,
    isCalendarVisible,
    setIsCalendarVisible,
  };
};
