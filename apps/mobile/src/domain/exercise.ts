import { z } from 'zod';

// ============================================
// ZOD SCHEMAS (Source of Truth)
// ============================================

export const ExerciseSchema = z.object({
  id: z.string().min(1, 'Exercise ID is required'),
  name: z.string().min(1, 'Exercise name is required'),
  category: z.string().min(1, 'Category is required'),
  bodyPart: z.string().min(1, 'Body part is required'),
  description: z.string().optional(),
  allowedUnits: z.array(z.enum(['load', 'time', 'reps', 'distance'])),
  isCustom: z.boolean().default(false),
});

// ============================================
// INFERRED TYPES (From Schemas)
// ============================================

export type Exercise = z.infer<typeof ExerciseSchema>;

export const EXERCISE_CATEGORIES = [
  'Barbell',
  'Dumbbell',
  'Bodyweight',
  'Machine',
  'Cable',
  'Kettlebell',
  'Other',
];

export const BODY_PARTS = [
  'Chest',
  'Back',
  'Shoulders',
  'Legs',
  'Biceps',
  'Triceps',
  'Forearms',
  'Abs',
  'Glutes',
  'Calves',
  'Other',
];
