import React, { useMemo } from 'react';
import {
  Calendar as RNCalendar,
  type CalendarProps as RNCalendarProps,
} from 'react-native-calendars';
import { Text, XStack, YStack } from 'tamagui';
import { Calendar as CalendarIcon } from '@tamagui/lucide-icons';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';

import { colors } from '@/theme/colors';
import { useTranslation } from '@/hooks/common/useTranslation';

export type CalendarProps = RNCalendarProps;

type CalendarTheme = NonNullable<CalendarProps['theme']>;

const baseTheme: CalendarTheme = {
  backgroundColor: colors.darkerGray,
  calendarBackground: colors.midGray,
  textSectionTitleColor: colors.white,
  textSectionTitleDisabledColor: 'rgba(255, 255, 255, 0.3)',
  selectedDayBackgroundColor: colors.niceOrange,
  selectedDayTextColor: colors.white,
  todayTextColor: colors.niceOrange,
  dayTextColor: colors.white,
  textDisabledColor: 'rgba(255, 255, 255, 0.35)',
  dotColor: colors.niceOrange,
  selectedDotColor: colors.white,
  arrowColor: colors.niceOrange,
  monthTextColor: colors.white,
  textMonthFontWeight: '700',
  textDayFontWeight: '600',
  textDayHeaderFontWeight: '600',
};

export function Calendar({
  theme,
  enableSwipeMonths = true,
  firstDay = 1,
  style,
  ...rest
}: CalendarProps) {
  const { i18n } = useTranslation();

  const mergedTheme = useMemo<CalendarTheme>(
    () => ({
      ...baseTheme,
      ...(theme ?? {}),
    }),
    [theme],
  );
  const defaultDate = rest.current
    ? new Date(rest.current).toISOString()
    : new Date().toISOString();

  const formattedDate = useMemo(() => {
    if (!rest.current) return '';
    return dayjs(rest.current).locale(i18n.language).format('MMMM D, YYYY');
  }, [rest.current, i18n.language]);

  return (
    <YStack space="$3">
      {rest.current ? (
        <XStack
          alignItems="center"
          justifyContent="space-between"
          backgroundColor="rgba(249, 115, 22, 0.15)"
          borderRadius="$4"
          padding="$2"
        >
          <Text color="$textPrimary" fontSize="$4" fontWeight="600">
            {formattedDate}
          </Text>
          <CalendarIcon size={22} color={colors.niceOrange} />
        </XStack>
      ) : null}
      <RNCalendar
        enableSwipeMonths={enableSwipeMonths}
        firstDay={firstDay}
        theme={mergedTheme}
        style={[{ paddingTop: 0, marginTop: -12 }, style]}
        {...rest}
        current={defaultDate}
      />
    </YStack>
  );
}
