import { z } from 'zod';

// ============================================
// ZOD SCHEMAS (Source of Truth)
// ============================================

export const UserPreferencesSchema = z.object({
  weightUnit: z.enum(['kg', 'lb']),
  distanceUnit: z.enum(['cm', 'ft']),
  temperatureUnit: z.enum(['celsius', 'fahrenheit']),
  onboardingCompleted: z.boolean().optional(),
});

export const UserProfileSchema = z.object({
  uid: z.string().min(1, 'User ID is required'),
  email: z.string().email('Invalid email address'),
  displayName: z.string().min(1, 'Display name is required'),
  preferences: UserPreferencesSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================
// INFERRED TYPES (From Schemas)
// ============================================

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
