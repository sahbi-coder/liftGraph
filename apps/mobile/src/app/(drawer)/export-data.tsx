import React, { useState, useCallback, useMemo } from 'react';
import { ScrollView, Modal, TouchableOpacity } from 'react-native';
import { YStack, XStack, Text, Button, Input } from 'tamagui';
import Feather from '@expo/vector-icons/Feather';
import {
  Dumbbell,
  Trophy,
  TrendingUp,
  Calendar as CalendarIcon,
  FileSpreadsheet,
  FileText,
  Code,
} from '@tamagui/lucide-icons';
import dayjs from 'dayjs';

import { colors } from '@/theme/colors';
import { Calendar } from '@/components/Calendar';

type DataType = 'workoutHistory' | 'personalRecords' | 'progressTracking' | 'trainingPrograms';
type ExportFormat = 'xlsx' | 'csv' | 'json';
type DateRangePreset = 'last30Days' | 'last6Months' | 'allTime' | 'custom';

export default function ExportDataScreen() {
  const [selectedDataTypes, setSelectedDataTypes] = useState<Set<DataType>>(
    new Set(['workoutHistory', 'personalRecords']),
  );
  const [exportFormat, setExportFormat] = useState<ExportFormat>('xlsx');
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('allTime');
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [isFromDatePickerVisible, setIsFromDatePickerVisible] = useState(false);
  const [isToDatePickerVisible, setIsToDatePickerVisible] = useState(false);

  const toggleDataType = useCallback((type: DataType) => {
    setSelectedDataTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  }, []);

  const handleDateRangePreset = useCallback((preset: DateRangePreset) => {
    setDateRangePreset(preset);
    if (preset === 'last30Days') {
      setFromDate(dayjs().subtract(30, 'days').format('YYYY-MM-DD'));
      setToDate(dayjs().format('YYYY-MM-DD'));
    } else if (preset === 'last6Months') {
      setFromDate(dayjs().subtract(6, 'months').format('YYYY-MM-DD'));
      setToDate(dayjs().format('YYYY-MM-DD'));
    } else if (preset === 'allTime') {
      setFromDate(null);
      setToDate(null);
    }
  }, []);

  const handleFromDateSelect = useCallback((day: { dateString: string }) => {
    setFromDate(day.dateString);
    setIsFromDatePickerVisible(false);
    setDateRangePreset('custom');
  }, []);

  const handleToDateSelect = useCallback((day: { dateString: string }) => {
    setToDate(day.dateString);
    setIsToDatePickerVisible(false);
    setDateRangePreset('custom');
  }, []);

  const formattedFromDate = useMemo(() => {
    if (!fromDate) return dayjs().format('DD/MM/YYYY');
    return dayjs(fromDate).format('DD/MM/YYYY');
  }, [fromDate]);

  const formattedToDate = useMemo(() => {
    if (!toDate) return dayjs().format('DD/MM/YYYY');
    return dayjs(toDate).format('DD/MM/YYYY');
  }, [toDate]);

  const dataTypes = [
    {
      id: 'workoutHistory' as DataType,
      label: 'Workout History',
      description: 'All completed workouts and exercises',
      icon: Dumbbell,
      color: colors.niceOrange,
    },
    {
      id: 'personalRecords' as DataType,
      label: 'Personal Records',
      description: '1RM, volume PRs, and achievements',
      icon: Trophy,
      color: colors.niceOrange,
    },
    {
      id: 'progressTracking' as DataType,
      label: 'Progress Tracking',
      description: 'Body weight, measurements, photos',
      icon: TrendingUp,
      color: colors.niceOrange,
    },
    {
      id: 'trainingPrograms' as DataType,
      label: 'Training Programs',
      description: 'Custom routines and templates',
      icon: CalendarIcon,
      color: colors.niceOrange,
    },
  ];

  const exportFormats = [
    {
      id: 'xlsx' as ExportFormat,
      label: 'Excel (.xlsx)',
      description: 'Best for analysis and charts',
      icon: FileSpreadsheet,
      color: '#16a34a',
    },
    {
      id: 'csv' as ExportFormat,
      label: 'CSV (.csv)',
      description: 'Compatible with most apps',
      icon: FileText,
      color: '#2563eb',
    },
    {
      id: 'json' as ExportFormat,
      label: 'JSON (.json)',
      description: 'For developers and advanced users',
      icon: Code,
      color: '#9333ea',
    },
  ];

  return (
    <YStack flex={1} backgroundColor={colors.darkerGray}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <YStack padding="$4" paddingTop="$10" space="$6">
          {/* Info Box */}
          <XStack
            backgroundColor="rgba(249, 115, 22, 0.1)"
            borderLeftWidth={4}
            borderLeftColor={colors.niceOrange}
            borderRadius="$3"
            padding="$4"
            space="$3"
            alignItems="flex-start"
          >
            <YStack
              width={24}
              height={24}
              borderRadius={12}
              backgroundColor={colors.niceOrange}
              justifyContent="center"
              alignItems="center"
              marginTop="$1"
            >
              <Text color={colors.white} fontSize="$3" fontWeight="bold">
                i
              </Text>
            </YStack>
            <YStack flex={1} space="$1">
              <Text color={colors.white} fontSize="$5" fontWeight="600">
                Export Your Training Data
              </Text>
              <Text color={colors.midGray} fontSize="$4" lineHeight="$1">
                Download your complete workout history, personal records, and training statistics in
                various formats for backup or analysis purposes.
              </Text>
            </YStack>
          </XStack>

          {/* SELECT DATA TYPES */}
          <YStack space="$3">
            <Text color={colors.white} fontSize="$6" fontWeight="600" textTransform="uppercase">
              Select Data Types
            </Text>
            <YStack space="$3">
              {dataTypes.map((type) => {
                const IconComponent = type.icon;
                const isSelected = selectedDataTypes.has(type.id);
                return (
                  <TouchableOpacity
                    key={type.id}
                    onPress={() => toggleDataType(type.id)}
                    activeOpacity={0.7}
                  >
                    <XStack
                      backgroundColor={colors.darkGray}
                      borderRadius="$3"
                      padding="$4"
                      space="$3"
                      alignItems="center"
                    >
                      <IconComponent size={24} color={type.color} />
                      <YStack flex={1} space="$1">
                        <Text color={colors.white} fontSize="$5" fontWeight="500">
                          {type.label}
                        </Text>
                        <Text color={colors.midGray} fontSize="$4">
                          {type.description}
                        </Text>
                      </YStack>
                      <XStack
                        width={24}
                        height={24}
                        borderRadius={4}
                        borderWidth={2}
                        borderColor={isSelected ? colors.niceOrange : colors.midGray}
                        backgroundColor={isSelected ? colors.niceOrange : 'transparent'}
                        justifyContent="center"
                        alignItems="center"
                      >
                        {isSelected && <Feather name="check" size={16} color={colors.white} />}
                      </XStack>
                    </XStack>
                  </TouchableOpacity>
                );
              })}
            </YStack>
          </YStack>

          {/* EXPORT FORMAT */}
          <YStack space="$3">
            <Text color={colors.white} fontSize="$6" fontWeight="600" textTransform="uppercase">
              Export Format
            </Text>
            <YStack space="$3">
              {exportFormats.map((format) => {
                const IconComponent = format.icon;
                const isSelected = exportFormat === format.id;
                return (
                  <TouchableOpacity
                    key={format.id}
                    onPress={() => setExportFormat(format.id)}
                    activeOpacity={0.7}
                  >
                    <XStack
                      backgroundColor={colors.darkGray}
                      borderRadius="$3"
                      padding="$4"
                      space="$3"
                      alignItems="center"
                    >
                      <IconComponent size={24} color={format.color} />
                      <YStack flex={1} space="$1">
                        <Text color={colors.white} fontSize="$5" fontWeight="500">
                          {format.label}
                        </Text>
                        <Text color={colors.midGray} fontSize="$4">
                          {format.description}
                        </Text>
                      </YStack>
                      <XStack
                        width={24}
                        height={24}
                        borderRadius={12}
                        borderWidth={2}
                        borderColor={isSelected ? colors.niceOrange : colors.midGray}
                        backgroundColor={isSelected ? colors.niceOrange : 'transparent'}
                        justifyContent="center"
                        alignItems="center"
                      >
                        {isSelected && (
                          <YStack
                            width={12}
                            height={12}
                            borderRadius={6}
                            backgroundColor={colors.white}
                          />
                        )}
                      </XStack>
                    </XStack>
                  </TouchableOpacity>
                );
              })}
            </YStack>
          </YStack>

          {/* DATE RANGE */}
          <YStack space="$3">
            <Text color={colors.white} fontSize="$6" fontWeight="600" textTransform="uppercase">
              Date Range
            </Text>
            <YStack space="$3">
              <YStack space="$2">
                <Text color={colors.midGray} fontSize="$4" fontWeight="500">
                  From Date
                </Text>
                <TouchableOpacity onPress={() => setIsFromDatePickerVisible(true)}>
                  <Input
                    value={formattedFromDate}
                    editable={false}
                    backgroundColor={colors.darkGray}
                    borderColor={colors.midGray}
                    color={colors.white}
                    placeholderTextColor={colors.midGray}
                    fontSize="$5"
                    padding="$3"
                  />
                </TouchableOpacity>
              </YStack>
              <YStack space="$2">
                <Text color={colors.midGray} fontSize="$4" fontWeight="500">
                  To Date
                </Text>
                <TouchableOpacity onPress={() => setIsToDatePickerVisible(true)}>
                  <Input
                    value={formattedToDate}
                    editable={false}
                    backgroundColor={colors.darkGray}
                    borderColor={colors.midGray}
                    color={colors.white}
                    placeholderTextColor={colors.midGray}
                    fontSize="$5"
                    padding="$3"
                  />
                </TouchableOpacity>
              </YStack>
              <XStack space="$3" marginTop="$2">
                <Button
                  flex={1}
                  backgroundColor={
                    dateRangePreset === 'last30Days' ? colors.niceOrange : colors.darkGray
                  }
                  color={colors.white}
                  onPress={() => handleDateRangePreset('last30Days')}
                  borderRadius="$3"
                  padding="$3"
                >
                  <Text fontSize="$4" fontWeight="500">
                    Last 30 Days
                  </Text>
                </Button>
                <Button
                  flex={1}
                  backgroundColor={
                    dateRangePreset === 'last6Months' ? colors.niceOrange : colors.darkGray
                  }
                  color={colors.white}
                  onPress={() => handleDateRangePreset('last6Months')}
                  borderRadius="$3"
                  padding="$3"
                >
                  <Text fontSize="$4" fontWeight="500">
                    Last 6 Months
                  </Text>
                </Button>
                <Button
                  flex={1}
                  backgroundColor={
                    dateRangePreset === 'allTime' ? colors.niceOrange : colors.darkGray
                  }
                  color={colors.white}
                  onPress={() => handleDateRangePreset('allTime')}
                  borderRadius="$3"
                  padding="$3"
                >
                  <Text fontSize="$4" fontWeight="500">
                    All Time
                  </Text>
                </Button>
              </XStack>
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>

      {/* From Date Picker Modal */}
      <Modal
        visible={isFromDatePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsFromDatePickerVisible(false)}
      >
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
            backgroundColor={colors.midGray}
            borderRadius="$4"
            padding="$4"
            space="$4"
          >
            <XStack alignItems="center" justifyContent="space-between">
              <Text color={colors.white} fontSize="$5" fontWeight="600">
                Select From Date
              </Text>
              <Button
                size="$2"
                variant="outlined"
                color={colors.white}
                onPress={() => setIsFromDatePickerVisible(false)}
              >
                Close
              </Button>
            </XStack>
            <Calendar
              current={fromDate || undefined}
              onDayPress={handleFromDateSelect}
              markedDates={
                fromDate
                  ? {
                      [fromDate]: {
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
      </Modal>

      {/* To Date Picker Modal */}
      <Modal
        visible={isToDatePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsToDatePickerVisible(false)}
      >
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
            backgroundColor={colors.midGray}
            borderRadius="$4"
            padding="$4"
            space="$4"
          >
            <XStack alignItems="center" justifyContent="space-between">
              <Text color={colors.white} fontSize="$5" fontWeight="600">
                Select To Date
              </Text>
              <Button
                size="$2"
                variant="outlined"
                color={colors.white}
                onPress={() => setIsToDatePickerVisible(false)}
              >
                Close
              </Button>
            </XStack>
            <Calendar
              current={toDate || undefined}
              onDayPress={handleToDateSelect}
              markedDates={
                toDate
                  ? {
                      [toDate]: {
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
      </Modal>
    </YStack>
  );
}
