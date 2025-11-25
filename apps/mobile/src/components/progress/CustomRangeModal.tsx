import React, { useState, useCallback, useMemo } from 'react';
import { Modal, ScrollView, Alert } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import dayjs from 'dayjs';
import { colors } from '@/theme/colors';
import { Calendar } from '@/components/Calendar';

interface CustomRangeModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => void;
  initialStartDate?: string | null;
  initialEndDate?: string | null;
}

export function CustomRangeModal({
  visible,
  onClose,
  onApply,
  initialStartDate,
  initialEndDate,
}: CustomRangeModalProps) {
  const [tempStartDate, setTempStartDate] = useState<string | null>(initialStartDate || null);
  const [tempEndDate, setTempEndDate] = useState<string | null>(initialEndDate || null);

  const handleStartDateSelect = useCallback(
    (day: { dateString: string }) => {
      setTempStartDate(day.dateString);
      // If end date is already set and is before or equal to the new start date, clear it
      if (tempEndDate && dayjs(day.dateString).isAfter(dayjs(tempEndDate))) {
        setTempEndDate(null);
      }
    },
    [tempEndDate],
  );

  const handleEndDateSelect = useCallback(
    (day: { dateString: string }) => {
      if (tempStartDate && dayjs(day.dateString).isBefore(dayjs(tempStartDate).add(1, 'day'))) {
        Alert.alert(
          'Invalid Date Range',
          'End date must be after the start date. Please select a later date.',
        );
        return;
      }
      setTempEndDate(day.dateString);
    },
    [tempStartDate],
  );

  const isValidDateRange = useMemo(() => {
    if (!tempStartDate || !tempEndDate) return false;
    return dayjs(tempEndDate).isAfter(dayjs(tempStartDate));
  }, [tempStartDate, tempEndDate]);

  const handleApply = useCallback(() => {
    if (!tempStartDate || !tempEndDate) {
      Alert.alert('Missing Dates', 'Please select both start and end dates.');
      return;
    }

    if (!isValidDateRange) {
      Alert.alert(
        'Invalid Date Range',
        'End date must be after the start date. Please select a valid date range.',
      );
      return;
    }

    onApply(tempStartDate, tempEndDate);
    onClose();
  }, [tempStartDate, tempEndDate, isValidDateRange, onApply, onClose]);

  const handleClose = useCallback(() => {
    setTempStartDate(initialStartDate || null);
    setTempEndDate(initialEndDate || null);
    onClose();
  }, [initialStartDate, initialEndDate, onClose]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <YStack
        flex={1}
        backgroundColor="rgba(0, 0, 0, 0.6)"
        justifyContent="center"
        alignItems="center"
        padding="$4"
      >
        <YStack
          width="90%"
          maxWidth={420}
          maxHeight="90%"
          backgroundColor={colors.midGray}
          borderRadius="$4"
          padding="$4"
          space="$4"
        >
          <XStack alignItems="center" justifyContent="space-between">
            <Text color={colors.white} fontSize="$5" fontWeight="600">
              Select Date Range
            </Text>
            <Button size="$2" variant="outlined" color={colors.white} onPress={handleClose}>
              Close
            </Button>
          </XStack>

          <ScrollView
            style={{ maxHeight: 600 }}
            contentContainerStyle={{ gap: 16 }}
            showsVerticalScrollIndicator
          >
            <YStack space="$3">
              <YStack space="$2">
                <Text color={colors.white} fontSize="$4" fontWeight="600">
                  Start Date
                </Text>
                <Calendar
                  current={tempStartDate || undefined}
                  onDayPress={handleStartDateSelect}
                  markedDates={
                    tempStartDate
                      ? {
                          [tempStartDate]: {
                            selected: true,
                            selectedColor: colors.niceOrange,
                            selectedTextColor: colors.white,
                          },
                        }
                      : undefined
                  }
                />
              </YStack>

              <YStack space="$2">
                <Text color={colors.white} fontSize="$4" fontWeight="600">
                  End Date
                </Text>
                <Calendar
                  current={tempEndDate || undefined}
                  onDayPress={handleEndDateSelect}
                  markedDates={
                    tempEndDate
                      ? {
                          [tempEndDate]: {
                            selected: true,
                            selectedColor: colors.niceOrange,
                            selectedTextColor: colors.white,
                          },
                        }
                      : undefined
                  }
                />
              </YStack>
            </YStack>
          </ScrollView>

          <XStack space="$3" justifyContent="flex-end">
            <Button
              backgroundColor={colors.darkGray}
              color={colors.white}
              borderWidth={1}
              borderColor={colors.white}
              onPress={handleClose}
            >
              Cancel
            </Button>
            <Button
              backgroundColor={colors.niceOrange}
              color={colors.white}
              onPress={handleApply}
              disabled={!isValidDateRange}
              opacity={!isValidDateRange ? 0.5 : 1}
            >
              Apply
            </Button>
          </XStack>
        </YStack>
      </YStack>
    </Modal>
  );
}
