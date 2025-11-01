import { z } from 'zod';

// Basic types for liftGraph
export const WorkoutSchema = z.object({
  id: z.string(),
  date: z.date(),
  exercises: z.array(
    z.object({
      name: z.string(),
      sets: z.array(
        z.object({
          weight: z.number(),
          reps: z.number(),
        }),
      ),
    }),
  ),
});

export type Workout = z.infer<typeof WorkoutSchema>;
