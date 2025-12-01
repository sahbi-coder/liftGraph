import { z } from 'zod';

// ============================================
// ZOD SCHEMAS (Source of Truth)
// ============================================

export const WorkoutSetSchema = z.object({
  weight: z.number().positive('Weight must be positive'),
  reps: z.number().positive('Reps must be a positive integer'),
  rir: z.number().min(0),
});

export const WorkoutExerciseSchema = z.object({
  exerciseId: z.string().min(1, 'Exercise ID is required'),
  exerciseOwnerId: z.string().nullable(),
  name: z.string().min(1, 'Exercise name is required'),
  order: z.number().int().nonnegative('Order must be non-negative'),
  sets: z.array(WorkoutSetSchema).min(1, 'At least one set is required'),
});

export const WorkoutInputSchema = z.object({
  date: z.date(),
  notes: z.string().optional(),
  exercises: z.array(WorkoutExerciseSchema).min(1, 'At least one exercise is required'),
});

export const WorkoutSchema = z.object({
  id: z.string(),
  date: z.date(),
  notes: z.string(),
  exercises: z.array(WorkoutExerciseSchema),
  validated: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================
// INFERRED TYPES (From Schemas)
// ============================================

export type WorkoutSet = z.infer<typeof WorkoutSetSchema>;
export type WorkoutExercise = z.infer<typeof WorkoutExerciseSchema>;
export type WorkoutInput = z.infer<typeof WorkoutInputSchema>;
export type Workout = z.infer<typeof WorkoutSchema>;
