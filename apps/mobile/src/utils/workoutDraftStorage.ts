import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WorkoutInput } from '@/services';

const DRAFT_STORAGE_KEY = 'workout_draft_create';

/**
 * Serialize WorkoutInput for storage (convert Date to ISO string)
 */
function serializeWorkoutDraft(data: WorkoutInput): string {
  return JSON.stringify({
    ...data,
    date: data.date.toISOString(),
  });
}

/**
 * Deserialize stored workout draft (convert ISO string back to Date)
 */
function deserializeWorkoutDraft(json: string): WorkoutInput | null {
  try {
    const parsed = JSON.parse(json);
    return {
      ...parsed,
      date: new Date(parsed.date),
    };
  } catch (error) {
    console.error('Error deserializing workout draft:', error);
    return null;
  }
}

/**
 * Save workout draft to AsyncStorage
 */
export async function saveWorkoutDraft(data: WorkoutInput): Promise<void> {
  try {
    const serialized = serializeWorkoutDraft(data);
    await AsyncStorage.setItem(DRAFT_STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Error saving workout draft:', error);
    // Fail silently - draft saving is not critical
  }
}

/**
 * Load workout draft from AsyncStorage
 */
export async function loadWorkoutDraft(): Promise<WorkoutInput | null> {
  try {
    const stored = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
    if (!stored) {
      return null;
    }
    return deserializeWorkoutDraft(stored);
  } catch (error) {
    console.error('Error loading workout draft:', error);
    return null;
  }
}

/**
 * Clear workout draft from AsyncStorage
 */
export async function clearWorkoutDraft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing workout draft:', error);
    // Fail silently
  }
}
