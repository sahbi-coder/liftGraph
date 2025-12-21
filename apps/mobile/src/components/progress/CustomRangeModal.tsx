import React, { useState, useCallback, useMemo } from 'react';
import { Modal, ScrollView } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import dayjs from 'dayjs';
import { colors } from '@/theme/colors';
import { Calendar } from '@/components/Calendar';
import { useAlertModal } from '@/hooks/common/useAlertModal';
import { useTranslation } from '@/hooks/common/useTranslation';

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
  const { t } = useTranslation();
  const [tempStartDate, setTempStartDate] = useState<string | null>(initialStartDate || null);
  const [tempEndDate, setTempEndDate] = useState<string | null>(initialEndDate || null);
  const { showWarning, AlertModalComponent } = useAlertModal();

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
        showWarning(t('customRange.endDateAfterStart'));
        return;
      }
      setTempEndDate(day.dateString);
    },
    [tempStartDate, showWarning, t],
  );

  const isValidDateRange = useMemo(() => {
    if (!tempStartDate || !tempEndDate) return false;
    return dayjs(tempEndDate).isAfter(dayjs(tempStartDate));
  }, [tempStartDate, tempEndDate]);

  const handleApply = useCallback(() => {
    if (!tempStartDate || !tempEndDate) {
      showWarning(t('customRange.selectBothDates'));
      return;
    }

    if (!isValidDateRange) {
      showWarning(t('customRange.endDateAfterStartValid'));
      return;
    }

    onApply(tempStartDate, tempEndDate);
    onClose();
  }, [tempStartDate, tempEndDate, isValidDateRange, onApply, onClose, showWarning, t]);

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
              {t('progress.selectDateRange')}
            </Text>
            <Button size="$2" variant="outlined" color={colors.white} onPress={handleClose}>
              {t('common.close')}
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
                  {t('progress.startDate')}
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
                  {t('progress.endDate')}
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
              {t('common.cancel')}
            </Button>
            <Button
              backgroundColor={colors.niceOrange}
              color={colors.white}
              onPress={handleApply}
              disabled={!isValidDateRange}
              opacity={!isValidDateRange ? 0.5 : 1}
            >
              {t('common.apply')}
            </Button>
          </XStack>
        </YStack>
      </YStack>
      <AlertModalComponent />
    </Modal>
  );
}
