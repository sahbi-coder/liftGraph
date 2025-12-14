import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { colors } from '@/theme/colors';
import { useTranslation } from '@/hooks/useTranslation';

type UseWorkoutDateProps = {
  date: string;
  validated: boolean;
  onValidateWorkout?: () => Promise<void> | void;
};

export const useWorkoutDate = ({ date, validated, onValidateWorkout }: UseWorkoutDateProps) => {
  const { t, i18n } = useTranslation();
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

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

  const markedDates = useMemo(() => {
    if (!selectedDateKey) {
      return undefined;
    }

    return {
      [selectedDateKey]: {
        selected: true,
        selectedColor: colors.niceOrange,
        selectedTextColor: colors.white,
      },
    };
  }, [selectedDateKey]);

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
