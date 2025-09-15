import { z } from "zod";

// User schemas with regulatory compliance
export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  age: z.number().min(1).max(120),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string(),
  medicalHistory: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  abhaId: z.string().optional(), // Ayushman Bharat Health Account
  language: z.string().default('en'),
  country: z.string().default('IN'), // For data residency compliance
  emergencyContacts: z.array(z.object({
    name: z.string(),
    phone: z.string(),
    relation: z.string(),
    email: z.string().email().optional()
  })).optional(),
  insuranceInfo: z.object({
    provider: z.string().optional(),
    policyNumber: z.string().optional(),
    validUntil: z.string().optional(),
    pmjayId: z.string().optional(), // PM-JAY scheme ID
    stateSchemeId: z.string().optional()
  }).optional(),
  // Consent management is handled via separate consentSchema to avoid duplication
  dataRetentionPreference: z.object({
    healthData: z.number().min(1).max(10), // Years
    aiAnalysis: z.number().min(1).max(5),
    emergencyData: z.number().min(1).max(3)
  }).optional(),
  privacySettings: z.object({
    shareWithDoctors: z.boolean().default(true),
    shareForResearch: z.boolean().default(false),
    marketingConsent: z.boolean().default(false)
  }).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  lastLoginAt: z.coerce.date().optional()
});

export const insertUserProfileSchema = userProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true
});

// Health data schemas with device provenance
export const vitalSignsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  heartRate: z.number().min(30).max(250),
  bloodPressureSystolic: z.number().min(60).max(250),
  bloodPressureDiastolic: z.number().min(40).max(150),
  oxygenSaturation: z.number().min(70).max(100),
  bodyTemperature: z.number().min(90).max(110),
  ecgData: z.string().optional(), // Base64 encoded ECG trace
  steps: z.number().min(0).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  // Device and data provenance for medical-grade vs fitness tracking
  deviceInfo: z.object({
    deviceId: z.string(),
    deviceType: z.enum(['wristband', 'smartwatch', 'medical_device', 'manual_entry']),
    manufacturer: z.string(),
    model: z.string(),
    isMedicalGrade: z.boolean(), // FDA/CE/ISO certified
    certifications: z.array(z.string()).optional(), // Medical certifications like FDA, CE, ISO_13485, IEC_60601
    firmwareVersion: z.string().optional()
  }),
  dataQuality: z.object({
    confidence: z.number().min(0).max(1), // AI confidence in reading accuracy
    signalQuality: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
    artifactsDetected: z.boolean().default(false)
  }),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    accuracy: z.number().optional() // GPS accuracy in meters
  }).optional(),
  timestamp: z.coerce.date(),
  syncedAt: z.coerce.date().optional() // When data was uploaded to cloud
});

export const insertVitalSignsSchema = vitalSignsSchema.omit({
  id: true,
  syncedAt: true
});

// Health analysis schemas
export const healthAnalysisSchema = z.object({
  id: z.string(),
  userId: z.string(),
  vitalSignsId: z.string(),
  analysis: z.string(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  recommendations: z.array(z.string()),
  anomalies: z.array(z.string()).optional(),
  aiConfidence: z.number().min(0).max(1),
  timestamp: z.coerce.date()
});

export const insertHealthAnalysisSchema = healthAnalysisSchema.omit({
  id: true
});

// Doctor schemas
export const doctorSchema = z.object({
  id: z.string(),
  name: z.string(),
  specialization: z.string(),
  qualification: z.string(),
  experience: z.number(),
  rating: z.number().min(0).max(5),
  consultationFee: z.number(),
  availability: z.array(z.object({
    day: z.string(),
    startTime: z.string(),
    endTime: z.string()
  })),
  hospitalAffiliation: z.string().optional(),
  languages: z.array(z.string()),
  isOnline: z.boolean().default(true)
});

// Emergency schemas
export const emergencyAlertSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['medical', 'fall', 'abnormal_vitals', 'manual']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional()
  }).optional(),
  vitalSigns: z.object({
    heartRate: z.number().optional(),
    bloodPressureSystolic: z.number().optional(),
    bloodPressureDiastolic: z.number().optional(),
    oxygenSaturation: z.number().optional()
  }).optional(),
  status: z.enum(['active', 'resolved', 'false_alarm']),
  timestamp: z.coerce.date()
});

// Donation schemas
export const donationSchema = z.object({
  id: z.string(),
  donorId: z.string(),
  recipientHospitalId: z.string(),
  donationType: z.enum(['blood', 'plasma', 'platelets', 'wbc', 'rbc']),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  quantity: z.number(),
  rewardCoins: z.number(),
  status: z.enum(['pending', 'completed', 'cancelled']),
  scheduledDate: z.coerce.date(),
  completedDate: z.coerce.date().optional()
});

// Report schemas
export const healthReportSchema = z.object({
  id: z.string(),
  userId: z.string(),
  doctorId: z.string().optional(),
  type: z.enum(['weekly', 'monthly', 'custom']),
  reportData: z.object({
    summary: z.string(),
    vitalsOverview: z.object({
      averageHeartRate: z.number(),
      averageBloodPressureSystolic: z.number(),
      averageBloodPressureDiastolic: z.number(),
      averageOxygenSaturation: z.number(),
      averageTemperature: z.number()
    }),
    recommendations: z.array(z.string()),
    riskFactors: z.array(z.string()),
    improvements: z.array(z.string())
  }),
  generatedAt: z.coerce.date(),
  sharedWith: z.array(z.string()).optional()
});

// Insurance claim schemas
export const insuranceClaimSchema = z.object({
  id: z.string(),
  userId: z.string(),
  policyNumber: z.string(),
  claimAmount: z.number(),
  treatmentType: z.string(),
  hospitalId: z.string(),
  documents: z.array(z.string()),
  status: z.enum(['submitted', 'under_review', 'approved', 'rejected']),
  submittedAt: z.coerce.date(),
  processedAt: z.coerce.date().optional()
});

// Audit log schema for compliance
export const auditLogSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  action: z.enum(['create', 'read', 'update', 'delete', 'export', 'share']),
  resource: z.string(), // Table/collection name
  resourceId: z.string(),
  details: z.record(z.any()).optional(),
  ipAddress: z.string().ip(), // Validates IPv4/IPv6 format
  userAgent: z.string(),
  timestamp: z.coerce.date(),
  compliance: z.object({
    gdprLawfulBasis: z.string().optional(),
    hipaaJustification: z.string().optional(),
    retention: z.coerce.date().optional()
  }).optional()
});

// Consent management schema
export const consentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['data_processing', 'ai_analysis', 'sharing_doctors', 'emergency_contacts', 'marketing', 'research']),
  purpose: z.string(),
  granted: z.boolean(),
  timestamp: z.coerce.date(),
  version: z.string(),
  lawfulBasis: z.string().optional(), // GDPR lawful basis
  expiryDate: z.coerce.date().optional(),
  withdrawnAt: z.coerce.date().optional()
});

// Device management schema
export const deviceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  deviceId: z.string(),
  deviceType: z.enum(['wristband', 'smartwatch', 'medical_device']),
  manufacturer: z.string(),
  model: z.string(),
  isMedicalGrade: z.boolean(),
  certifications: z.array(z.string()),
  isActive: z.boolean().default(true),
  lastSyncAt: z.coerce.date().optional(),
  registeredAt: z.coerce.date()
});

// Partnership schemas
export const hospitalSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  pincode: z.string(),
  phone: z.string(),
  email: z.string().email(),
  specialties: z.array(z.string()),
  rating: z.number().min(0).max(5),
  isPartner: z.boolean().default(false),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number()
  }),
  operatingHours: z.array(z.object({
    day: z.string(),
    open: z.string(),
    close: z.string()
  })),
  emergencyServices: z.boolean().default(false)
});

export const pharmacySchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  phone: z.string(),
  isPartner: z.boolean().default(false),
  deliveryAvailable: z.boolean().default(false),
  operatingHours: z.array(z.object({
    day: z.string(),
    open: z.string(),
    close: z.string()
  }))
});

// Medicine and prescription schemas
export const medicineSchema = z.object({
  id: z.string(),
  name: z.string(),
  genericName: z.string(),
  manufacturer: z.string(),
  composition: z.string(),
  dosageForm: z.enum(['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops']),
  strength: z.string(),
  price: z.number(),
  prescriptionRequired: z.boolean()
});

export const prescriptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  doctorId: z.string(),
  medicines: z.array(z.object({
    medicineId: z.string(),
    quantity: z.number(),
    dosage: z.string(),
    frequency: z.string(),
    duration: z.string(),
    instructions: z.string().optional()
  })),
  issuedAt: z.coerce.date(),
  validUntil: z.coerce.date(),
  status: z.enum(['active', 'expired', 'fulfilled'])
});

// Missing insert schemas for all models
export const insertDoctorSchema = doctorSchema.omit({
  id: true
});

export const insertEmergencyAlertSchema = emergencyAlertSchema.omit({
  id: true
});

export const insertDonationSchema = donationSchema.omit({
  id: true
});

export const insertHealthReportSchema = healthReportSchema.omit({
  id: true
});

export const insertInsuranceClaimSchema = insuranceClaimSchema.omit({
  id: true
});

export const insertAuditLogSchema = auditLogSchema.omit({
  id: true
});

export const insertConsentSchema = consentSchema.omit({
  id: true
});

export const insertDeviceSchema = deviceSchema.omit({
  id: true,
  registeredAt: true
});

export const insertHospitalSchema = hospitalSchema.omit({
  id: true
});

export const insertPharmacySchema = pharmacySchema.omit({
  id: true
});

export const insertMedicineSchema = medicineSchema.omit({
  id: true
});

export const insertPrescriptionSchema = prescriptionSchema.omit({
  id: true
});

// Enhanced type exports
export type UserProfile = z.infer<typeof userProfileSchema>;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type VitalSigns = z.infer<typeof vitalSignsSchema>;
export type InsertVitalSigns = z.infer<typeof insertVitalSignsSchema>;
export type HealthAnalysis = z.infer<typeof healthAnalysisSchema>;
export type InsertHealthAnalysis = z.infer<typeof insertHealthAnalysisSchema>;
export type Doctor = z.infer<typeof doctorSchema>;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type EmergencyAlert = z.infer<typeof emergencyAlertSchema>;
export type InsertEmergencyAlert = z.infer<typeof insertEmergencyAlertSchema>;
export type Donation = z.infer<typeof donationSchema>;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type HealthReport = z.infer<typeof healthReportSchema>;
export type InsertHealthReport = z.infer<typeof insertHealthReportSchema>;
export type InsuranceClaim = z.infer<typeof insuranceClaimSchema>;
export type InsertInsuranceClaim = z.infer<typeof insertInsuranceClaimSchema>;
export type AuditLog = z.infer<typeof auditLogSchema>;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type Consent = z.infer<typeof consentSchema>;
export type InsertConsent = z.infer<typeof insertConsentSchema>;
export type Device = z.infer<typeof deviceSchema>;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Hospital = z.infer<typeof hospitalSchema>;
export type InsertHospital = z.infer<typeof insertHospitalSchema>;
export type Pharmacy = z.infer<typeof pharmacySchema>;
export type InsertPharmacy = z.infer<typeof insertPharmacySchema>;
export type Medicine = z.infer<typeof medicineSchema>;
export type InsertMedicine = z.infer<typeof insertMedicineSchema>;
export type Prescription = z.infer<typeof prescriptionSchema>;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
