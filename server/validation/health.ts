import { z } from 'zod';

export const VitalSignsSchema = z.object({
  heartRate: z.number().min(30).max(220),
  bloodPressureSystolic: z.number().min(70).max(250),
  bloodPressureDiastolic: z.number().min(40).max(150),
  oxygenSaturation: z.number().min(70).max(100),
  bodyTemperature: z.number().min(90).max(110),
  timestamp: z.coerce.date().refine(d => !isNaN(d.getTime()), { 
    message: 'Invalid timestamp - must be a valid date string or Date object' 
  })
});

export const UserProfileSchema = z.object({
  age: z.number().min(0).max(150),
  gender: z.string().min(1),
  medicalHistory: z.string().optional()
});

export const HealthAnalysisRequestSchema = z.object({
  vitals: VitalSignsSchema,
  userProfile: UserProfileSchema
});

export const ChatRequestSchema = z.object({
  message: z.string().min(1),
  healthContext: VitalSignsSchema.optional(),
  userProfile: UserProfileSchema.optional()
});