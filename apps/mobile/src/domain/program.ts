import { z } from 'zod';

// ============================================
// ZOD SCHEMAS (Source of Truth)
// ============================================

export const ProgramSetSchema = z.object({
  reps: z.number().int().positive('Reps must be positive'),
  rir: z.number().int().min(0).max(10, 'RIR must be between 0-10'),
});

export const ProgramDayLabelSchema = z.enum([
  'Day1',
  'Day2',
  'Day3',
  'Day4',
  'Day5',
  'Day6',
  'Day7',
]);

export type ProgramDayLabel = z.infer<typeof ProgramDayLabelSchema>;

export const ProgramExerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required'),
  id: z.string().min(1, 'Exercise ID is required'),

  sets: z.array(ProgramSetSchema).min(1, 'At least one set is required'),
});

export const ProgramDaySchema = z.union([
  z.object({
    label: ProgramDayLabelSchema,
    name: z.string().min(1, 'Day name is required'),
    exercises: z.array(ProgramExerciseSchema),
  }),
  z.literal('rest'),
]);

export const ProgramWeekSchema = z.object({
  name: z.string().optional(),
  days: z.array(ProgramDaySchema),
});

export const ProgramPhaseSchema = z.object({
  name: z.string().min(1, 'Phase name is required'),
  description: z.string(),
  weeks: z.array(ProgramWeekSchema).min(1, 'At least one week is required'),
});

export const SimpleProgramInputSchema = z.object({
  name: z.string().min(1, 'Program name is required'),
  description: z.string(),
  type: z.literal('simple'),
  week: ProgramWeekSchema,
});
const AlternatingWeeksSchema = z.tuple([ProgramWeekSchema, ProgramWeekSchema]);
export type AlternatingWeeks = z.infer<typeof AlternatingWeeksSchema>;
export const AlternatingProgramInputSchema = z.object({
  name: z.string().min(1, 'Program name is required'),
  description: z.string(),
  type: z.literal('alternating'),
  alternatingWeeks: AlternatingWeeksSchema,
});

export const AdvancedProgramInputSchema = z.object({
  name: z.string().min(1, 'Program name is required'),
  description: z.string(),
  type: z.literal('advanced'),
  phases: z.array(ProgramPhaseSchema).min(1, 'At least one phase is required'),
});

export const ProgramInputSchema: z.ZodDiscriminatedUnion<
  'type',
  [
    typeof SimpleProgramInputSchema,
    typeof AlternatingProgramInputSchema,
    typeof AdvancedProgramInputSchema,
  ]
> = z.discriminatedUnion('type', [
  SimpleProgramInputSchema,
  AlternatingProgramInputSchema,
  AdvancedProgramInputSchema,
]);

export const SimpleProgramSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Program name is required'),
  description: z.string(),
  type: z.literal('simple'),
  week: ProgramWeekSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AlternatingProgramSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Program name is required'),
  description: z.string(),
  type: z.literal('alternating'),
  alternatingWeeks: z.tuple([ProgramWeekSchema, ProgramWeekSchema]),
});

export const AdvancedProgramSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Program name is required'),
  description: z.string(),
  type: z.literal('advanced'),
  phases: z.array(ProgramPhaseSchema).min(1, 'At least one phase is required'),
});

export const ProgramSchema: z.ZodDiscriminatedUnion<
  'type',
  [typeof SimpleProgramSchema, typeof AlternatingProgramSchema, typeof AdvancedProgramSchema]
> = z.discriminatedUnion('type', [
  SimpleProgramSchema,
  AlternatingProgramSchema,
  AdvancedProgramSchema,
]);

// ============================================
// INFERRED TYPES (From Schemas)
// ============================================

export type ProgramSet = z.infer<typeof ProgramSetSchema>;
export type ProgramExercise = z.infer<typeof ProgramExerciseSchema>;
export type ProgramDay = z.infer<typeof ProgramDaySchema>;
export type ProgramWeek = z.infer<typeof ProgramWeekSchema>;
export type ProgramPhase = z.infer<typeof ProgramPhaseSchema>;
export type SimpleProgramInput = z.infer<typeof SimpleProgramInputSchema>;
export type AlternatingProgramInput = z.infer<typeof AlternatingProgramInputSchema>;
export type AdvancedProgramInput = z.infer<typeof AdvancedProgramInputSchema>;
export type ProgramInput = z.infer<typeof ProgramInputSchema>;
export type SimpleProgram = z.infer<typeof SimpleProgramSchema>;
export type AlternatingProgram = z.infer<typeof AlternatingProgramSchema>;
export type AdvancedProgram = z.infer<typeof AdvancedProgramSchema>;
export type Program = z.infer<typeof ProgramSchema>;
