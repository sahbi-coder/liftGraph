import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import type { Workout } from '@/services';

export type ExportFormat = 'csv' | 'xlsx' | 'json';

/**
 * Filters workouts based on date range
 */
export function filterWorkoutsByDateRange(
  workouts: Workout[],
  fromDate: string | null,
  toDate: string | null,
): Workout[] {
  if (!fromDate && !toDate) {
    return workouts;
  }

  return workouts.filter((workout) => {
    const workoutDate = dayjs(workout.date);
    const from = fromDate ? dayjs(fromDate) : null;
    const to = toDate ? dayjs(toDate) : null;

    if (from && workoutDate.isBefore(from, 'day')) {
      return false;
    }
    if (to && workoutDate.isAfter(to, 'day')) {
      return false;
    }
    return true;
  });
}

/**
 * Converts workouts to CSV format
 */
export function workoutsToCSV(workouts: Workout[]): string {
  if (workouts.length === 0) {
    return '';
  }

  // CSV Headers
  const headers = [
    'Workout ID',
    'Date',
    'Notes',
    'Validated',
    'Exercise Name',
    'Exercise ID',
    'Exercise Order',
    'Set Number',
    'Weight (kg)',
    'Reps',
    'RIR',
  ];

  // Build CSV rows
  const rows: string[][] = [headers];

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      exercise.sets.forEach((set, setIndex) => {
        rows.push([
          workout.id,
          dayjs(workout.date).format('YYYY-MM-DD'),
          workout.notes || '',
          workout.validated ? 'Yes' : 'No',
          exercise.name,
          exercise.exerciseId,
          exercise.order.toString(),
          (setIndex + 1).toString(),
          set.weight.toString(),
          set.reps.toString(),
          set.rir.toString(),
        ]);
      });
    });
  });

  // Convert to CSV string
  return rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
}

/**
 * Converts workouts to Excel format
 */
export function workoutsToExcel(workouts: Workout[]): XLSX.WorkBook {
  if (workouts.length === 0) {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([[]]), 'Workouts');
    return wb;
  }

  // Prepare data for Excel
  const data: any[][] = [
    [
      'Workout ID',
      'Date',
      'Notes',
      'Validated',
      'Exercise Name',
      'Exercise ID',
      'Exercise Order',
      'Set Number',
      'Weight (kg)',
      'Reps',
      'RIR',
    ],
  ];

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      exercise.sets.forEach((set, setIndex) => {
        data.push([
          workout.id,
          dayjs(workout.date).format('YYYY-MM-DD'),
          workout.notes || '',
          workout.validated ? 'Yes' : 'No',
          exercise.name,
          exercise.exerciseId,
          exercise.order,
          setIndex + 1,
          set.weight,
          set.reps,
          set.rir,
        ]);
      });
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Workouts');

  return wb;
}

/**
 * Converts workouts to JSON format
 */
export function workoutsToJSON(workouts: Workout[]): string {
  // Convert workouts to plain objects, ensuring dates are serialized
  const serialized = workouts.map((workout) => ({
    id: workout.id,
    date: dayjs(workout.date).format('YYYY-MM-DD'),
    notes: workout.notes,
    validated: workout.validated,
    exercises: workout.exercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,

      name: exercise.name,
      order: exercise.order,
      sets: exercise.sets.map((set) => ({
        weight: set.weight,
        reps: set.reps,
        rir: set.rir,
      })),
    })),
    createdAt: dayjs(workout.createdAt).toISOString(),
    updatedAt: dayjs(workout.updatedAt).toISOString(),
  }));

  return JSON.stringify(serialized, null, 2);
}

/**
 * Exports workouts to a file and shares it
 */
export async function exportWorkouts(
  workouts: Workout[],
  format: ExportFormat,
  fromDate: string | null,
  toDate: string | null,
): Promise<void> {
  // Check if FileSystem module is available at runtime
  if (!FileSystem || !FileSystem.writeAsStringAsync) {
    throw new Error(
      'FileSystem module is not available. If you are using a development build, please rebuild the app. If using Expo Go, this feature requires a development build.',
    );
  }

  // Filter workouts by date range
  const filteredWorkouts = filterWorkoutsByDateRange(workouts, fromDate, toDate);

  if (filteredWorkouts.length === 0) {
    throw new Error('No workouts found in the selected date range');
  }

  const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
  let fileName: string;
  let fileContent: string | Uint8Array;
  let mimeType: string;

  if (format === 'json') {
    fileName = `workouts_${timestamp}.json`;
    fileContent = workoutsToJSON(filteredWorkouts);
    mimeType = 'application/json';
  } else if (format === 'csv') {
    fileName = `workouts_${timestamp}.csv`;
    fileContent = workoutsToCSV(filteredWorkouts);
    mimeType = 'text/csv';
  } else {
    // Excel format
    fileName = `workouts_${timestamp}.xlsx`;
    const workbook = workoutsToExcel(filteredWorkouts);
    // Use 'base64' type for React Native compatibility
    fileContent = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
    mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }

  // Write file to device storage
  // Check if FileSystem module is available
  if (!FileSystem || typeof (FileSystem as any).documentDirectory === 'undefined') {
    throw new Error(
      'FileSystem module is not available. Please rebuild the app or use a development build.',
    );
  }

  const documentDir = (FileSystem as any).documentDirectory as string | null;
  if (!documentDir) {
    throw new Error('Document directory is not available');
  }
  const fileUri = `${documentDir}${fileName}`;

  if (format === 'xlsx') {
    // For Excel, write base64 string directly
    // XLSX.write with type: 'base64' returns a base64-encoded string
    await FileSystem.writeAsStringAsync(fileUri, fileContent as string, {
      encoding: 'base64',
    });
  } else {
    // For CSV and JSON, write as UTF-8 string
    await FileSystem.writeAsStringAsync(fileUri, fileContent as string, {
      encoding: 'utf8',
    });
  }

  // Share the file
  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(fileUri, {
      mimeType,
      dialogTitle: `Export workouts as ${format.toUpperCase()}`,
    });
  } else {
    throw new Error('Sharing is not available on this device');
  }
}
