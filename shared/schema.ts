import { z } from "zod";
import { pgTable, varchar, integer, timestamp, boolean, real, jsonb, text, serial } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

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
  dosageForm: z.enum(['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler']),
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

// Medical Report Upload & Analysis schemas (different from health reports - these are uploaded documents)
export const medicalReportSchema = z.object({
  id: z.string(),
  userId: z.string(),
  fileName: z.string(),
  originalFileName: z.string(),
  fileType: z.enum(['pdf', 'jpeg', 'png', 'dicom', 'doc', 'docx']),
  mimeType: z.string(),
  fileSize: z.number(),
  checksum: z.string(), // SHA-256 for integrity
  storageUrl: z.string(), // Firebase Storage URL
  reportType: z.enum(['lab_report', 'xray', 'mri', 'ct_scan', 'prescription', 'medical_record', 'other']),
  sourceType: z.enum(['appointment', 'lab_booking', 'user_upload']).optional(),
  sourceId: z.string().optional(), // appointmentId or labBookingId
  doctorId: z.string().optional(), // Doctor who uploaded (if any)
  uploadedAt: z.coerce.date(),
  isAnalyzed: z.boolean().default(false),
  analysis: z.object({
    summary: z.string(),
    keyFindings: z.array(z.string()),
    recommendations: z.array(z.string()),
    followUpNeeded: z.boolean(),
    analyzedAt: z.coerce.date(),
    confidence: z.number().min(0).max(1),
    aiModelUsed: z.string().optional(),
    aiModelVersion: z.string().optional(),
    language: z.string().default('en')
  }).optional(),
  sharedWith: z.array(z.string()).default([]), // Doctor IDs who have access
  tags: z.array(z.string()).default([]),
  isEncrypted: z.boolean().default(true),
  isDeidentified: z.boolean().default(false)
});

// Pathology Lab schemas
export const labSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  phone: z.string(),
  email: z.string().email(),
  rating: z.number().min(0).max(5).default(0),
  isPartner: z.boolean().default(false),
  homeCollectionAvailable: z.boolean().default(false),
  homeCollectionFee: z.number().default(0),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number()
  }),
  operatingHours: z.array(z.object({
    day: z.string(),
    open: z.string(),
    close: z.string()
  })),
  specializations: z.array(z.string()).default([]), // pathology, radiology, cardiology, etc.
  accreditations: z.array(z.string()).default([]), // NABL, CAP, ISO certifications
  reportDeliveryTime: z.object({
    normal: z.string(), // "24 hours"
    urgent: z.string()  // "4 hours"
  })
});

export const labTestSchema = z.object({
  id: z.string(),
  labId: z.string(),
  name: z.string(),
  category: z.string(), // Blood Test, Urine Test, Imaging, etc.
  description: z.string(),
  price: z.number(),
  discountedPrice: z.number().optional(),
  sampleType: z.enum(['blood', 'urine', 'stool', 'saliva', 'tissue', 'imaging', 'other']),
  fastingRequired: z.boolean().default(false),
  fastingHours: z.number().default(0),
  reportTime: z.string(), // "24 hours", "2 days", etc.
  instructions: z.string().optional(),
  normalRanges: z.record(z.string()).optional() // For reference values
});

const labBookingSchemaBase = z.object({
  id: z.string(),
  userId: z.string(),
  labId: z.string(),
  testIds: z.array(z.string()),
  bookingType: z.enum(['home_collection', 'lab_visit']),
  scheduledDate: z.coerce.date(),
  scheduledTime: z.string(), // "10:00 AM"
  patientInfo: z.object({
    name: z.string(),
    age: z.number(),
    gender: z.string(),
    phone: z.string()
  }),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    landmark: z.string().optional()
  }).optional(),
  totalAmount: z.number(),
  paymentStatus: z.enum(['pending', 'paid', 'failed']).default('pending'),
  status: z.enum(['booked', 'sample_collected', 'processing', 'completed', 'cancelled']).default('booked'),
  phlebotomistId: z.string().optional(), // Assigned phlebotomist for home collection
  reportFileId: z.string().optional(), // Links to medicalReportSchema
  cancellationReason: z.string().optional(),
  bookedAt: z.coerce.date(),
  completedAt: z.coerce.date().optional(),
  notes: z.string().optional()
});

export const labBookingSchema = labBookingSchemaBase.refine((data) => {
  // Require address for home collection
  return data.bookingType !== 'home_collection' || data.address;
}, {
  message: "Address is required for home collection",
  path: ["address"]
});

// Appointment schemas (separate from doctor availability)
const appointmentSchemaBase = z.object({
  id: z.string(),
  userId: z.string(),
  doctorId: z.string(),
  appointmentType: z.enum(['video_call', 'clinic_visit', 'home_visit']),
  scheduledDateTime: z.coerce.date(), // ISO datetime with timezone
  timezone: z.string().default('Asia/Kolkata'),
  duration: z.number().default(30), // in minutes
  consultationFee: z.number(),
  status: z.enum(['scheduled', 'ongoing', 'completed', 'cancelled', 'no_show']).default('scheduled'),
  paymentStatus: z.enum(['pending', 'paid', 'refunded']).default('pending'),
  symptoms: z.string().optional(),
  medicalReports: z.array(z.string()).default([]), // Medical report IDs shared for this appointment
  prescription: z.string().optional(), // Prescription ID if issued
  meetingLink: z.string().optional(), // For video calls
  clinicId: z.string().optional(), // For clinic visits
  doctorNotes: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.coerce.date().optional(),
  cancellationReason: z.string().optional(),
  noShowReason: z.string().optional(),
  bookedAt: z.coerce.date(),
  completedAt: z.coerce.date().optional()
});

export const appointmentSchema = appointmentSchemaBase.refine((data) => {
  // Require meeting link for video calls
  return data.appointmentType !== 'video_call' || data.meetingLink;
}, {
  message: "Meeting link is required for video calls",
  path: ["meetingLink"]
});

// Medicine Order schemas
const orderSchemaBase = z.object({
  id: z.string(),
  userId: z.string(),
  pharmacyId: z.string().optional(),
  orderItems: z.array(z.object({
    medicineId: z.string(),
    quantity: z.number().min(1),
    price: z.number(), // Final price per unit at time of order
    prescriptionRequired: z.boolean()
  })),
  prescriptionId: z.string().optional(),
  deliveryAddress: z.object({
    name: z.string(),
    phone: z.string(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    landmark: z.string().optional(),
    isDefault: z.boolean().default(false)
  }),
  totalAmount: z.number(),
  deliveryFee: z.number().default(0),
  discount: z.number().default(0),
  finalAmount: z.number(),
  currency: z.string().default('INR'),
  paymentId: z.string().optional(), // Payment gateway transaction ID
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).default('pending'),
  orderStatus: z.enum(['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled']).default('placed'),
  estimatedDelivery: z.coerce.date().optional(),
  deliveredAt: z.coerce.date().optional(),
  trackingId: z.string().optional(),
  orderedAt: z.coerce.date()
});

export const orderSchema = orderSchemaBase.refine((data) => {
  // Require prescription if any item needs it
  const needsPrescription = data.orderItems.some(item => item.prescriptionRequired);
  return !needsPrescription || data.prescriptionId;
}, {
  message: "Prescription is required for prescription medicines",
  path: ["prescriptionId"]
});

// Donor Profile & Hospital Rating schemas
export const donorProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  isAvailable: z.boolean().default(true),
  lastDonationDate: z.coerce.date().optional(),
  totalDonations: z.number().default(0),
  rewardCoins: z.number().default(0),
  donorType: z.enum(['blood', 'plasma', 'platelets', 'all']).default('all'),
  location: z.object({
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number()
    }).optional()
  }),
  medicalEligibility: z.object({
    weight: z.number().min(50), // kg
    hemoglobin: z.number().min(12.5), // g/dL
    lastHealthCheck: z.coerce.date().optional(),
    isEligible: z.boolean().default(true)
  }),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relation: z.string()
  }),
  registeredAt: z.coerce.date()
});

export const hospitalRatingSchema = z.object({
  id: z.string(),
  userId: z.string(),
  hospitalId: z.string(),
  rating: z.number().min(1).max(5),
  review: z.string().optional(),
  serviceType: z.enum(['emergency', 'consultation', 'surgery', 'diagnostic', 'general']),
  visitDate: z.coerce.date(),
  isVerified: z.boolean().default(false),
  helpful: z.number().default(0), // How many found this helpful
  createdAt: z.coerce.date()
});

export const doctorRatingSchema = z.object({
  id: z.string(),
  userId: z.string(),
  doctorId: z.string(),
  rating: z.number().min(1).max(5),
  review: z.string().optional(),
  visitDate: z.coerce.date(),
  isVerified: z.boolean().default(false),
  helpful: z.number().default(0), // How many found this helpful
  createdAt: z.coerce.date()
});

export const donationRequestSchema = z.object({
  id: z.string(),
  hospitalId: z.string(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  donationType: z.enum(['blood', 'plasma', 'platelets']),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'critical']),
  unitsNeeded: z.number(),
  unitsCollected: z.number().default(0),
  location: z.object({
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number()
    }).optional()
  }),
  patientInfo: z.object({
    age: z.number().optional(),
    condition: z.string(),
    department: z.string().optional(),
    ward: z.string().optional(),
    isEmergency: z.boolean().default(false)
  }),
  validUntil: z.coerce.date(),
  contactPerson: z.object({
    name: z.string(),
    phone: z.string(),
    designation: z.string()
  }),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date()
});

// Insert schemas for new models
export const insertMedicalReportSchema = medicalReportSchema.omit({
  id: true,
  uploadedAt: true
});

export const insertLabSchema = labSchema.omit({
  id: true
});

export const insertLabTestSchema = labTestSchema.omit({
  id: true
});

export const insertLabBookingSchema = labBookingSchemaBase.omit({
  id: true,
  bookedAt: true
});

export const insertAppointmentSchema = appointmentSchemaBase.omit({
  id: true,
  bookedAt: true
});

export const insertOrderSchema = orderSchemaBase.omit({
  id: true,
  orderedAt: true
});

export const insertDonorProfileSchema = donorProfileSchema.omit({
  id: true,
  registeredAt: true
});

export const insertHospitalRatingSchema = hospitalRatingSchema.omit({
  id: true,
  createdAt: true
});

export const insertDoctorRatingSchema = doctorRatingSchema.omit({
  id: true,
  createdAt: true
});

export const insertDonationRequestSchema = donationRequestSchema.omit({
  id: true,
  createdAt: true
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
export type MedicalReport = z.infer<typeof medicalReportSchema>;
export type InsertMedicalReport = z.infer<typeof insertMedicalReportSchema>;
export type Lab = z.infer<typeof labSchema>;
export type InsertLab = z.infer<typeof insertLabSchema>;
export type LabTest = z.infer<typeof labTestSchema>;
export type InsertLabTest = z.infer<typeof insertLabTestSchema>;
export type LabBooking = z.infer<typeof labBookingSchema>;
export type InsertLabBooking = z.infer<typeof insertLabBookingSchema>;
export type Appointment = z.infer<typeof appointmentSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Order = z.infer<typeof orderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type DonorProfile = z.infer<typeof donorProfileSchema>;
export type InsertDonorProfile = z.infer<typeof insertDonorProfileSchema>;
export type HospitalRating = z.infer<typeof hospitalRatingSchema>;
export type InsertHospitalRating = z.infer<typeof insertHospitalRatingSchema>;
export type DoctorRating = z.infer<typeof doctorRatingSchema>;
export type InsertDoctorRating = z.infer<typeof insertDoctorRatingSchema>;
export type DonationRequest = z.infer<typeof donationRequestSchema>;
export type InsertDonationRequest = z.infer<typeof insertDonationRequestSchema>;

// Drizzle table definitions
export const userProfilesTable = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  name: varchar("name").notNull(),
  age: integer("age").notNull(),
  gender: varchar("gender").notNull(),
  phone: varchar("phone").notNull(),
  medicalHistory: text("medical_history"),
  allergies: jsonb("allergies").$type<string[]>(),
  medications: jsonb("medications").$type<string[]>(),
  abhaId: varchar("abha_id"),
  language: varchar("language").notNull().default("en"),
  country: varchar("country").notNull().default("IN"),
  emergencyContacts: jsonb("emergency_contacts").$type<Array<{name: string; phone: string; relation: string; email?: string}>>(),
  insuranceInfo: jsonb("insurance_info").$type<{provider?: string; policyNumber?: string; validUntil?: string; pmjayId?: string; stateSchemeId?: string}>(),
  dataRetentionPreference: jsonb("data_retention_preference").$type<{healthData: number; aiAnalysis: number; emergencyData: number}>(),
  privacySettings: jsonb("privacy_settings").$type<{shareWithDoctors: boolean; shareForResearch: boolean; marketingConsent: boolean}>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

export const vitalSignsTable = pgTable("vital_signs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => userProfilesTable.id),
  heartRate: integer("heart_rate").notNull(),
  bloodPressureSystolic: integer("blood_pressure_systolic").notNull(),
  bloodPressureDiastolic: integer("blood_pressure_diastolic").notNull(),
  oxygenSaturation: integer("oxygen_saturation").notNull(),
  bodyTemperature: real("body_temperature").notNull(),
  ecgData: text("ecg_data"),
  steps: integer("steps"),
  sleepHours: real("sleep_hours"),
  deviceInfo: jsonb("device_info").$type<{deviceId: string; deviceType: string; manufacturer: string; model: string; isMedicalGrade: boolean; certifications?: string[]; firmwareVersion?: string}>().notNull(),
  dataQuality: jsonb("data_quality").$type<{confidence: number; signalQuality?: string; artifactsDetected: boolean}>().notNull(),
  location: jsonb("location").$type<{latitude?: number; longitude?: number; accuracy?: number}>(),
  timestamp: timestamp("timestamp").notNull(),
  syncedAt: timestamp("synced_at"),
});

export const healthAnalysisTable = pgTable("health_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => userProfilesTable.id),
  vitalSignsId: varchar("vital_signs_id").notNull().references(() => vitalSignsTable.id),
  analysis: text("analysis").notNull(),
  riskLevel: varchar("risk_level").notNull(),
  recommendations: jsonb("recommendations").$type<string[]>().notNull(),
  anomalies: jsonb("anomalies").$type<string[]>(),
  aiConfidence: real("ai_confidence").notNull(),
  timestamp: timestamp("timestamp").notNull(),
});

export const doctorsTable = pgTable("doctors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  specialization: varchar("specialization").notNull(),
  qualification: varchar("qualification").notNull(),
  experience: integer("experience").notNull(),
  rating: real("rating").notNull(),
  consultationFee: real("consultation_fee").notNull(),
  availability: jsonb("availability").$type<Array<{day: string; startTime: string; endTime: string}>>().notNull(),
  hospitalAffiliation: varchar("hospital_affiliation"),
  languages: jsonb("languages").$type<string[]>().notNull(),
  isOnline: boolean("is_online").notNull().default(true),
});

export const medicalReportsTable = pgTable("medical_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => userProfilesTable.id),
  fileName: varchar("file_name").notNull(),
  originalFileName: varchar("original_file_name").notNull(),
  fileType: varchar("file_type").notNull(),
  mimeType: varchar("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  checksum: varchar("checksum").notNull(),
  storageUrl: varchar("storage_url").notNull(),
  reportType: varchar("report_type").notNull(),
  sourceType: varchar("source_type"),
  sourceId: varchar("source_id"),
  doctorId: varchar("doctor_id"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  isAnalyzed: boolean("is_analyzed").notNull().default(false),
  analysis: jsonb("analysis").$type<{summary: string; keyFindings: string[]; recommendations: string[]; followUpNeeded: boolean; analyzedAt: Date; confidence: number; aiModelUsed?: string; aiModelVersion?: string; language: string}>(),
  sharedWith: jsonb("shared_with").$type<string[]>().notNull().default([]),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  isEncrypted: boolean("is_encrypted").notNull().default(true),
  isDeidentified: boolean("is_deidentified").notNull().default(false),
});

export const labsTable = pgTable("labs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  address: varchar("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  pincode: varchar("pincode").notNull(),
  phone: varchar("phone").notNull(),
  email: varchar("email").notNull(),
  rating: real("rating").notNull().default(0),
  isPartner: boolean("is_partner").notNull().default(false),
  homeCollectionAvailable: boolean("home_collection_available").notNull().default(false),
  homeCollectionFee: real("home_collection_fee").notNull().default(0),
  coordinates: jsonb("coordinates").$type<{latitude: number; longitude: number}>().notNull(),
  operatingHours: jsonb("operating_hours").$type<Array<{day: string; open: string; close: string}>>().notNull(),
  specializations: jsonb("specializations").$type<string[]>().notNull().default([]),
  accreditations: jsonb("accreditations").$type<string[]>().notNull().default([]),
  reportDeliveryTime: jsonb("report_delivery_time").$type<{normal: string; urgent: string}>().notNull(),
});

export const labTestsTable = pgTable("lab_tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  labId: varchar("lab_id").notNull().references(() => labsTable.id),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  discountedPrice: real("discounted_price"),
  sampleType: varchar("sample_type").notNull(),
  fastingRequired: boolean("fasting_required").notNull().default(false),
  fastingHours: integer("fasting_hours").notNull().default(0),
  reportTime: varchar("report_time").notNull(),
  instructions: text("instructions"),
  normalRanges: jsonb("normal_ranges").$type<Record<string, string>>(),
});

export const labBookingsTable = pgTable("lab_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => userProfilesTable.id),
  labId: varchar("lab_id").notNull().references(() => labsTable.id),
  testIds: jsonb("test_ids").$type<string[]>().notNull(),
  bookingType: varchar("booking_type").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  scheduledTime: varchar("scheduled_time").notNull(),
  patientInfo: jsonb("patient_info").$type<{name: string; age: number; gender: string; phone: string}>().notNull(),
  address: jsonb("address").$type<{street: string; city: string; state: string; pincode: string; landmark?: string}>(),
  totalAmount: real("total_amount").notNull(),
  paymentStatus: varchar("payment_status").notNull().default("pending"),
  status: varchar("status").notNull().default("booked"),
  phlebotomistId: varchar("phlebotomist_id"),
  reportFileId: varchar("report_file_id"),
  cancellationReason: text("cancellation_reason"),
  bookedAt: timestamp("booked_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
});

export const appointmentsTable = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => userProfilesTable.id),
  doctorId: varchar("doctor_id").notNull().references(() => doctorsTable.id),
  appointmentType: varchar("appointment_type").notNull(),
  scheduledDateTime: timestamp("scheduled_date_time").notNull(),
  timezone: varchar("timezone").notNull().default("Asia/Kolkata"),
  duration: integer("duration").notNull().default(30),
  consultationFee: real("consultation_fee").notNull(),
  status: varchar("status").notNull().default("scheduled"),
  paymentStatus: varchar("payment_status").notNull().default("pending"),
  symptoms: text("symptoms"),
  medicalReports: jsonb("medical_reports").$type<string[]>().notNull().default([]),
  prescription: varchar("prescription"),
  meetingLink: varchar("meeting_link"),
  clinicId: varchar("clinic_id"),
  doctorNotes: text("doctor_notes"),
  followUpRequired: boolean("follow_up_required").notNull().default(false),
  followUpDate: timestamp("follow_up_date"),
  cancellationReason: text("cancellation_reason"),
  noShowReason: text("no_show_reason"),
  bookedAt: timestamp("booked_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const medicinesTable = pgTable("medicines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  genericName: varchar("generic_name").notNull(),
  manufacturer: varchar("manufacturer").notNull(),
  composition: varchar("composition").notNull(),
  dosageForm: varchar("dosage_form").notNull(),
  strength: varchar("strength").notNull(),
  price: real("price").notNull(),
  prescriptionRequired: boolean("prescription_required").notNull(),
});

export const ordersTable = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => userProfilesTable.id),
  pharmacyId: varchar("pharmacy_id"),
  orderItems: jsonb("order_items").$type<Array<{medicineId: string; quantity: number; price: number; prescriptionRequired: boolean}>>().notNull(),
  prescriptionId: varchar("prescription_id"),
  deliveryAddress: jsonb("delivery_address").$type<{name: string; phone: string; street: string; city: string; state: string; pincode: string; landmark?: string; isDefault: boolean}>().notNull(),
  totalAmount: real("total_amount").notNull(),
  deliveryFee: real("delivery_fee").notNull().default(0),
  discount: real("discount").notNull().default(0),
  finalAmount: real("final_amount").notNull(),
  currency: varchar("currency").notNull().default("INR"),
  paymentId: varchar("payment_id"),
  paymentStatus: varchar("payment_status").notNull().default("pending"),
  orderStatus: varchar("order_status").notNull().default("placed"),
  estimatedDelivery: timestamp("estimated_delivery"),
  deliveredAt: timestamp("delivered_at"),
  trackingId: varchar("tracking_id"),
  orderedAt: timestamp("ordered_at").notNull().defaultNow(),
});

export const prescriptionsTable = pgTable("prescriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => userProfilesTable.id),
  doctorId: varchar("doctor_id").notNull().references(() => doctorsTable.id),
  medicines: jsonb("medicines").$type<Array<{medicineId: string; quantity: number; dosage: string; frequency: string; duration: string; instructions?: string}>>().notNull(),
  issuedAt: timestamp("issued_at").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  status: varchar("status").notNull(),
});

export const hospitalsTable = pgTable("hospitals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  address: varchar("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  country: varchar("country").notNull(),
  pincode: varchar("pincode").notNull(),
  phone: varchar("phone").notNull(),
  email: varchar("email").notNull(),
  specialties: jsonb("specialties").$type<string[]>().notNull(),
  rating: real("rating").notNull(),
  isPartner: boolean("is_partner").notNull().default(false),
  coordinates: jsonb("coordinates").$type<{latitude: number; longitude: number}>().notNull(),
  operatingHours: jsonb("operating_hours").$type<Array<{day: string; open: string; close: string}>>().notNull(),
  emergencyServices: boolean("emergency_services").notNull().default(false),
});

export const pharmaciesTable = pgTable("pharmacies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  address: varchar("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  phone: varchar("phone").notNull(),
  isPartner: boolean("is_partner").notNull().default(false),
  deliveryAvailable: boolean("delivery_available").notNull().default(false),
  operatingHours: jsonb("operating_hours").$type<Array<{day: string; open: string; close: string}>>().notNull(),
});

export const donorProfilesTable = pgTable("donor_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => userProfilesTable.id),
  bloodGroup: varchar("blood_group").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  lastDonationDate: timestamp("last_donation_date"),
  totalDonations: integer("total_donations").notNull().default(0),
  rewardCoins: integer("reward_coins").notNull().default(0),
  donorType: varchar("donor_type").notNull().default("all"),
  location: jsonb("location").$type<{city: string; state: string; pincode: string; coordinates?: {latitude: number; longitude: number}}>().notNull(),
  medicalEligibility: jsonb("medical_eligibility").$type<{weight: number; hemoglobin: number; lastHealthCheck?: Date; isEligible: boolean}>().notNull(),
  emergencyContact: jsonb("emergency_contact").$type<{name: string; phone: string; relation: string}>().notNull(),
  registeredAt: timestamp("registered_at").notNull().defaultNow(),
});

export const donationsTable = pgTable("donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  donorId: varchar("donor_id").notNull(),
  recipientHospitalId: varchar("recipient_hospital_id").notNull(),
  donationType: varchar("donation_type").notNull(),
  bloodGroup: varchar("blood_group").notNull(),
  quantity: real("quantity").notNull(),
  rewardCoins: integer("reward_coins").notNull(),
  status: varchar("status").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  completedDate: timestamp("completed_date"),
});

export const donationRequestsTable = pgTable("donation_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hospitalId: varchar("hospital_id").notNull(),
  bloodGroup: varchar("blood_group").notNull(),
  donationType: varchar("donation_type").notNull(),
  urgencyLevel: varchar("urgency_level").notNull(),
  unitsNeeded: integer("units_needed").notNull(),
  unitsCollected: integer("units_collected").notNull().default(0),
  location: jsonb("location").$type<{city: string; state: string; pincode: string; coordinates?: {latitude: number; longitude: number}}>().notNull(),
  patientInfo: jsonb("patient_info").$type<{age?: number; condition: string; department?: string; ward?: string; isEmergency: boolean}>().notNull(),
  validUntil: timestamp("valid_until").notNull(),
  contactPerson: jsonb("contact_person").$type<{name: string; phone: string; designation: string}>().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const hospitalRatingsTable = pgTable("hospital_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => userProfilesTable.id),
  hospitalId: varchar("hospital_id").notNull().references(() => hospitalsTable.id),
  rating: integer("rating").notNull(),
  review: text("review"),
  serviceType: varchar("service_type").notNull(),
  visitDate: timestamp("visit_date").notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  helpful: integer("helpful").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const doctorRatingsTable = pgTable("doctor_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => userProfilesTable.id),
  doctorId: varchar("doctor_id").notNull().references(() => doctorsTable.id),
  rating: integer("rating").notNull(),
  review: text("review"),
  visitDate: timestamp("visit_date").notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  helpful: integer("helpful").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Mentor-Student System Tables
export const mentorProfilesTable = pgTable("mentor_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => userProfilesTable.id), // Can be null for external mentors
  email: varchar("email").notNull().unique(),
  name: varchar("name").notNull(),
  age: integer("age").notNull(),
  gender: varchar("gender").notNull(),
  phone: varchar("phone").notNull(),
  mentorType: varchar("mentor_type").notNull(), // 'college_senior', 'professional', 'psychologist', 'counselor'
  specialization: jsonb("specialization").$type<string[]>().notNull(), // ['academic_stress', 'career_guidance', 'emotional_wellbeing', etc.]
  qualifications: jsonb("qualifications").$type<{degree: string; institution: string; year: number; certification?: string}[]>().notNull(),
  experience: integer("experience").notNull(), // years
  bio: text("bio").notNull(),
  languages: jsonb("languages").$type<string[]>().notNull().default(['en']),
  availability: jsonb("availability").$type<{day: string; startTime: string; endTime: string; timezone: string}[]>().notNull(),
  verificationStatus: varchar("verification_status").notNull().default('pending'), // 'pending', 'verified', 'rejected'
  verificationDocuments: jsonb("verification_documents").$type<{type: string; url: string; uploadedAt: string}[]>().default([]),
  rating: real("rating").default(0),
  totalSessions: integer("total_sessions").default(0),
  isActive: boolean("is_active").notNull().default(true),
  isOnline: boolean("is_online").default(false),
  lastActiveAt: timestamp("last_active_at"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const studentProfilesTable = pgTable("student_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => userProfilesTable.id), // Can be null for anonymous students
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  displayName: varchar("display_name"), // For anonymous students
  email: varchar("email"), // Optional for anonymous
  age: integer("age"),
  gender: varchar("gender"),
  grade: varchar("grade"), // '11th', '12th', 'college_1st_year', etc.
  school: varchar("school"),
  city: varchar("city"),
  state: varchar("state"),
  interests: jsonb("interests").$type<string[]>().default([]),
  concernAreas: jsonb("concern_areas").$type<string[]>().notNull(), // Areas where student needs guidance
  privacyLevel: varchar("privacy_level").notNull().default('moderate'), // 'minimal', 'moderate', 'high'
  parentalConsent: boolean("parental_consent").default(false),
  emergencyContact: jsonb("emergency_contact").$type<{name?: string; phone?: string; relation?: string}>(),
  isActive: boolean("is_active").notNull().default(true),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const guidanceCategoriesTable = pgTable("guidance_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description").notNull(),
  icon: varchar("icon").notNull(), // Icon name for UI
  color: varchar("color").notNull(), // Color code for UI
  keywords: jsonb("keywords").$type<string[]>().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const mentorStudentSessionsTable = pgTable("mentor_student_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => studentProfilesTable.id),
  mentorId: varchar("mentor_id").notNull().references(() => mentorProfilesTable.id),
  categoryId: varchar("category_id").references(() => guidanceCategoriesTable.id),
  sessionType: varchar("session_type").notNull(), // 'chat', 'voice_call', 'video_call'
  status: varchar("status").notNull().default('active'), // 'active', 'completed', 'terminated', 'escalated'
  priority: varchar("priority").notNull().default('normal'), // 'low', 'normal', 'high', 'urgent'
  sessionTitle: varchar("session_title"),
  initialConcern: text("initial_concern"),
  mentorNotes: text("mentor_notes"),
  summary: text("summary"),
  outcome: varchar("outcome"), // 'resolved', 'ongoing', 'referral_needed', 'emergency'
  rating: integer("rating"), // Student's rating of the session
  feedback: text("feedback"), // Student's feedback
  duration: integer("duration"), // Session duration in minutes
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const mentorStudentMessagesTable = pgTable("mentor_student_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => mentorStudentSessionsTable.id),
  senderId: varchar("sender_id").notNull(), // Can be student or mentor ID
  senderType: varchar("sender_type").notNull(), // 'student' or 'mentor'
  messageType: varchar("message_type").notNull().default('text'), // 'text', 'image', 'file', 'voice', 'system'
  content: text("content"),
  attachments: jsonb("attachments").$type<{type: string; url: string; name: string; size?: number}[]>().default([]),
  isEncrypted: boolean("is_encrypted").notNull().default(true),
  readAt: timestamp("read_at"),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});

export const mentorResourcesTable = pgTable("mentor_resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mentorId: varchar("mentor_id").notNull().references(() => mentorProfilesTable.id),
  categoryId: varchar("category_id").references(() => guidanceCategoriesTable.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  resourceType: varchar("resource_type").notNull(), // 'article', 'video', 'pdf', 'exercise', 'tip'
  content: text("content"), // For articles/tips
  attachments: jsonb("attachments").$type<{type: string; url: string; name: string; description?: string}[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  targetAge: jsonb("target_age").$type<{min: number; max: number}>(),
  isApproved: boolean("is_approved").notNull().default(false),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const emergencyEscalationsTable = pgTable("emergency_escalations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => mentorStudentSessionsTable.id),
  studentId: varchar("student_id").notNull().references(() => studentProfilesTable.id),
  mentorId: varchar("mentor_id").notNull().references(() => mentorStudentSessionsTable.id),
  escalationType: varchar("escalation_type").notNull(), // 'depression', 'suicidal_ideation', 'self_harm', 'abuse', 'immediate_danger'
  severity: varchar("severity").notNull(), // 'medium', 'high', 'critical'
  triggerKeywords: jsonb("trigger_keywords").$type<string[]>().default([]),
  detectedAt: timestamp("detected_at").notNull(),
  mentorResponse: text("mentor_response"),
  actionTaken: varchar("action_taken"), // 'counselor_referral', 'emergency_contact', 'crisis_helpline', 'parent_notified'
  professionalContacted: jsonb("professional_contacted").$type<{name?: string; phone?: string; type?: string; contactedAt?: string}>(),
  followUpRequired: boolean("follow_up_required").default(true),
  followUpAt: timestamp("follow_up_at"),
  status: varchar("status").notNull().default('open'), // 'open', 'handled', 'resolved'
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const mentorRatingsTable = pgTable("mentor_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => studentProfilesTable.id),
  mentorId: varchar("mentor_id").notNull().references(() => mentorProfilesTable.id),
  sessionId: varchar("session_id").references(() => mentorStudentSessionsTable.id),
  rating: integer("rating").notNull(),
  review: text("review"),
  categories: jsonb("categories").$type<{helpfulness: number; communication: number; expertise: number; empathy: number}>(),
  wouldRecommend: boolean("would_recommend").default(true),
  isAnonymous: boolean("is_anonymous").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reportedContentTable = pgTable("reported_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id"), // Can be student or mentor
  reporterType: varchar("reporter_type").notNull(), // 'student' or 'mentor'
  contentType: varchar("content_type").notNull(), // 'message', 'session', 'resource'
  contentId: varchar("content_id").notNull(), // ID of the reported content
  reason: varchar("reason").notNull(), // 'inappropriate', 'harassment', 'privacy_violation', 'other'
  description: text("description"),
  status: varchar("status").notNull().default('pending'), // 'pending', 'under_review', 'resolved', 'dismissed'
  reviewedBy: varchar("reviewed_by"), // Admin/moderator ID
  reviewNotes: text("review_notes"),
  actionTaken: varchar("action_taken"), // 'warning', 'content_removed', 'user_suspended', 'no_action'
  reportedAt: timestamp("reported_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

// Mentor-Student System Zod Schemas
export const mentorProfileSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  email: z.string().email(),
  name: z.string(),
  age: z.number().min(18).max(65),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string(),
  mentorType: z.enum(['college_senior', 'professional', 'psychologist', 'counselor']),
  specialization: z.array(z.string()),
  qualifications: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.number(),
    certification: z.string().optional()
  })),
  experience: z.number().min(0).max(50),
  bio: z.string().max(1000),
  languages: z.array(z.string()).default(['en']),
  availability: z.array(z.object({
    day: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    timezone: z.string()
  })),
  verificationStatus: z.enum(['pending', 'verified', 'rejected']).default('pending'),
  verificationDocuments: z.array(z.object({
    type: z.string(),
    url: z.string(),
    uploadedAt: z.string()
  })).default([]),
  rating: z.number().min(0).max(5).default(0),
  totalSessions: z.number().default(0),
  isActive: z.boolean().default(true),
  isOnline: z.boolean().default(false),
  lastActiveAt: z.coerce.date().optional(),
  joinedAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export const studentProfileSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  displayName: z.string().optional(),
  email: z.string().email().optional(),
  age: z.number().min(13).max(25).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  grade: z.string().optional(),
  school: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  interests: z.array(z.string()).default([]),
  concernAreas: z.array(z.string()),
  privacyLevel: z.enum(['minimal', 'moderate', 'high']).default('moderate'),
  parentalConsent: z.boolean().default(false),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relation: z.string().optional()
  }).optional(),
  isActive: z.boolean().default(true),
  joinedAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export const guidanceCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  color: z.string(),
  keywords: z.array(z.string()),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date()
});

export const mentorStudentSessionSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  mentorId: z.string(),
  categoryId: z.string().optional(),
  sessionType: z.enum(['chat', 'voice_call', 'video_call']),
  status: z.enum(['active', 'completed', 'terminated', 'escalated']).default('active'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  sessionTitle: z.string().optional(),
  initialConcern: z.string().optional(),
  mentorNotes: z.string().optional(),
  summary: z.string().optional(),
  outcome: z.enum(['resolved', 'ongoing', 'referral_needed', 'emergency']).optional(),
  rating: z.number().min(1).max(5).optional(),
  feedback: z.string().optional(),
  duration: z.number().min(0).optional(),
  scheduledAt: z.coerce.date().optional(),
  startedAt: z.coerce.date().optional(),
  endedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export const mentorStudentMessageSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  senderId: z.string(),
  senderType: z.enum(['student', 'mentor']),
  messageType: z.enum(['text', 'image', 'file', 'voice', 'system']).default('text'),
  content: z.string().optional(),
  attachments: z.array(z.object({
    type: z.string(),
    url: z.string(),
    name: z.string(),
    size: z.number().optional()
  })).default([]),
  isEncrypted: z.boolean().default(true),
  readAt: z.coerce.date().optional(),
  sentAt: z.coerce.date()
});

export const mentorResourceSchema = z.object({
  id: z.string(),
  mentorId: z.string(),
  categoryId: z.string().optional(),
  title: z.string().max(200),
  description: z.string().max(1000),
  resourceType: z.enum(['article', 'video', 'pdf', 'exercise', 'tip']),
  content: z.string().optional(),
  attachments: z.array(z.object({
    type: z.string(),
    url: z.string(),
    name: z.string(),
    description: z.string().optional()
  })).default([]),
  tags: z.array(z.string()).default([]),
  targetAge: z.object({
    min: z.number(),
    max: z.number()
  }).optional(),
  isApproved: z.boolean().default(false),
  views: z.number().default(0),
  likes: z.number().default(0),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export const emergencyEscalationSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  studentId: z.string(),
  mentorId: z.string(),
  escalationType: z.enum(['depression', 'suicidal_ideation', 'self_harm', 'abuse', 'immediate_danger']),
  severity: z.enum(['medium', 'high', 'critical']),
  triggerKeywords: z.array(z.string()).default([]),
  detectedAt: z.coerce.date(),
  mentorResponse: z.string().optional(),
  actionTaken: z.enum(['counselor_referral', 'emergency_contact', 'crisis_helpline', 'parent_notified']).optional(),
  professionalContacted: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    type: z.string().optional(),
    contactedAt: z.string().optional()
  }).optional(),
  followUpRequired: z.boolean().default(true),
  followUpAt: z.coerce.date().optional(),
  status: z.enum(['open', 'handled', 'resolved']).default('open'),
  notes: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export const mentorRatingSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  mentorId: z.string(),
  sessionId: z.string().optional(),
  rating: z.number().min(1).max(5),
  review: z.string().optional(),
  categories: z.object({
    helpfulness: z.number().min(1).max(5),
    communication: z.number().min(1).max(5),
    expertise: z.number().min(1).max(5),
    empathy: z.number().min(1).max(5)
  }).optional(),
  wouldRecommend: z.boolean().default(true),
  isAnonymous: z.boolean().default(true),
  createdAt: z.coerce.date()
});

export const reportedContentSchema = z.object({
  id: z.string(),
  reporterId: z.string().optional(),
  reporterType: z.enum(['student', 'mentor']),
  contentType: z.enum(['message', 'session', 'resource']),
  contentId: z.string(),
  reason: z.enum(['inappropriate', 'harassment', 'privacy_violation', 'other']),
  description: z.string().optional(),
  status: z.enum(['pending', 'under_review', 'resolved', 'dismissed']).default('pending'),
  reviewedBy: z.string().optional(),
  reviewNotes: z.string().optional(),
  actionTaken: z.enum(['warning', 'content_removed', 'user_suspended', 'no_action']).optional(),
  reportedAt: z.coerce.date(),
  reviewedAt: z.coerce.date().optional()
});

// Insert schemas for mentor-student system
export const insertMentorProfileSchema = mentorProfileSchema.omit({
  id: true,
  joinedAt: true,
  updatedAt: true
});

export const insertStudentProfileSchema = studentProfileSchema.omit({
  id: true,
  joinedAt: true,
  updatedAt: true
});

export const insertGuidanceCategorySchema = guidanceCategorySchema.omit({
  id: true,
  createdAt: true
});

export const insertMentorStudentSessionSchema = mentorStudentSessionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertMentorStudentMessageSchema = mentorStudentMessageSchema.omit({
  id: true,
  sentAt: true
});

export const insertMentorResourceSchema = mentorResourceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertEmergencyEscalationSchema = emergencyEscalationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertMentorRatingSchema = mentorRatingSchema.omit({
  id: true,
  createdAt: true
});

export const insertReportedContentSchema = reportedContentSchema.omit({
  id: true,
  reportedAt: true
});

// Type exports for mentor-student system
export type MentorProfile = z.infer<typeof mentorProfileSchema>;
export type InsertMentorProfile = z.infer<typeof insertMentorProfileSchema>;
export type StudentProfile = z.infer<typeof studentProfileSchema>;
export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;
export type GuidanceCategory = z.infer<typeof guidanceCategorySchema>;
export type InsertGuidanceCategory = z.infer<typeof insertGuidanceCategorySchema>;
export type MentorStudentSession = z.infer<typeof mentorStudentSessionSchema>;
export type InsertMentorStudentSession = z.infer<typeof insertMentorStudentSessionSchema>;
export type MentorStudentMessage = z.infer<typeof mentorStudentMessageSchema>;
export type InsertMentorStudentMessage = z.infer<typeof insertMentorStudentMessageSchema>;
export type MentorResource = z.infer<typeof mentorResourceSchema>;
export type InsertMentorResource = z.infer<typeof insertMentorResourceSchema>;
export type EmergencyEscalation = z.infer<typeof emergencyEscalationSchema>;
export type InsertEmergencyEscalation = z.infer<typeof insertEmergencyEscalationSchema>;
export type MentorRating = z.infer<typeof mentorRatingSchema>;
export type InsertMentorRating = z.infer<typeof insertMentorRatingSchema>;
export type ReportedContent = z.infer<typeof reportedContentSchema>;
export type InsertReportedContent = z.infer<typeof insertReportedContentSchema>;
