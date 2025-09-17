import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, desc, sql } from "drizzle-orm";
import { 
  userProfilesTable, vitalSignsTable, healthAnalysisTable, doctorsTable,
  medicalReportsTable, labsTable, labTestsTable, labBookingsTable,
  appointmentsTable, medicinesTable, ordersTable, prescriptionsTable,
  hospitalsTable, pharmaciesTable, donorProfilesTable, donationsTable,
  donationRequestsTable, hospitalRatingsTable, doctorRatingsTable
} from "@shared/schema";
import { 
  type UserProfile, type InsertUserProfile,
  type MedicalReport, type InsertMedicalReport,
  type Lab, type InsertLab,
  type LabTest, type InsertLabTest,
  type LabBooking, type InsertLabBooking,
  type Doctor, type InsertDoctor,
  type Appointment, type InsertAppointment,
  type Medicine, type InsertMedicine,
  type Order, type InsertOrder,
  type Prescription, type InsertPrescription,
  type Hospital, type InsertHospital,
  type Pharmacy, type InsertPharmacy,
  type DonorProfile, type InsertDonorProfile,
  type Donation, type InsertDonation,
  type DonationRequest, type InsertDonationRequest,
  type HospitalRating, type InsertHospitalRating,
  type DoctorRating, type InsertDoctorRating,
  type VitalSigns, type InsertVitalSigns,
  type HealthAnalysis, type InsertHealthAnalysis
} from "@shared/schema";
import { IStorage } from "./storage";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql_conn = neon(process.env.DATABASE_URL);
const db = drizzle(sql_conn);

export class DbStorage implements IStorage {
  constructor() {
    if (process.env.NODE_ENV === 'development') {
      this.initializeDemoUser();
    }
  }

  private async initializeDemoUser() {
    try {
      // Check if demo user already exists
      const existingUser = await this.getUserByEmail('demo@sehatify.com');
      if (existingUser) {
        console.log('Demo user already exists in database:', existingUser.email);
        return;
      }

      // Create demo user
      const demoUser = await this.createUser({
        email: 'demo@sehatify.com',
        name: 'Demo User',
        age: 30,
        gender: 'male',
        phone: '+91-9876543210',
        medicalHistory: 'No major medical history',
        abhaId: 'AB123456789',
        language: 'en',
        country: 'IN'
      });
      
      console.log('Demo user initialized in database:', demoUser.email);
    } catch (error) {
      console.error('Error initializing demo user:', error);
    }
  }

  // User operations
  async getUser(id: string): Promise<UserProfile | undefined> {
    const result = await db.select().from(userProfilesTable).where(eq(userProfilesTable.id, id)).limit(1);
    return result[0] as UserProfile;
  }

  async getUserByEmail(email: string): Promise<UserProfile | undefined> {
    const normalizedEmail = email.trim().toLowerCase();
    const result = await db.select().from(userProfilesTable).where(eq(userProfilesTable.email, normalizedEmail)).limit(1);
    return result[0] as UserProfile;
  }

  async createUser(insertUser: InsertUserProfile): Promise<UserProfile> {
    const normalizedEmail = insertUser.email.trim().toLowerCase();
    
    // Check for existing user
    const existing = await this.getUserByEmail(normalizedEmail);
    if (existing) {
      throw new Error(`User with email ${insertUser.email} already exists`);
    }

    const result = await db.insert(userProfilesTable).values({
      ...insertUser,
      email: normalizedEmail
    }).returning();
    
    return result[0];
  }

  async updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile | undefined> {
    // Handle email normalization if email is being updated
    const updateData = { ...updates };
    if (updateData.email) {
      updateData.email = updateData.email.trim().toLowerCase();
      
      // Check if the new email is already taken by another user
      const existingUser = await this.getUserByEmail(updateData.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error(`User with email ${updateData.email} already exists`);
      }
    }

    const result = await db.update(userProfilesTable)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(userProfilesTable.id, id))
      .returning();
    
    return result[0] as UserProfile;
  }

  // Medical Report operations
  async getMedicalReport(id: string): Promise<MedicalReport | undefined> {
    const result = await db.select().from(medicalReportsTable).where(eq(medicalReportsTable.id, id)).limit(1);
    return result[0] as MedicalReport;
  }

  async getMedicalReportsByUserId(userId: string): Promise<MedicalReport[]> {
    const result = await db.select().from(medicalReportsTable).where(eq(medicalReportsTable.userId, userId));
    return result as MedicalReport[];
  }

  async createMedicalReport(insertReport: InsertMedicalReport): Promise<MedicalReport> {
    const result = await db.insert(medicalReportsTable).values(insertReport).returning();
    return result[0];
  }

  async updateMedicalReport(id: string, updates: Partial<MedicalReport>): Promise<MedicalReport | undefined> {
    const result = await db.update(medicalReportsTable)
      .set(updates)
      .where(eq(medicalReportsTable.id, id))
      .returning();
    
    return result[0] as MedicalReport;
  }

  async deleteMedicalReport(id: string): Promise<boolean> {
    const result = await db.delete(medicalReportsTable).where(eq(medicalReportsTable.id, id));
    return result.rowCount > 0;
  }

  // Lab operations
  async getLab(id: string): Promise<Lab | undefined> {
    const result = await db.select().from(labsTable).where(eq(labsTable.id, id)).limit(1);
    return result[0] as Lab;
  }

  async getLabs(filters?: { city?: string; specializations?: string[] }): Promise<Lab[]> {
    let query = db.select().from(labsTable);
    
    if (filters?.city) {
      query = query.where(sql`LOWER(${labsTable.city}) LIKE ${`%${filters.city.toLowerCase()}%`}`);
    }
    
    // Note: For specializations filtering with JSONB, we'd need more complex SQL
    // This is a simplified implementation
    const result = await query;
    return result as Lab[];
  }

  async createLab(insertLab: InsertLab): Promise<Lab> {
    const result = await db.insert(labsTable).values(insertLab).returning();
    return result[0] as Lab;
  }

  // Lab Test operations
  async getLabTest(id: string): Promise<LabTest | undefined> {
    const result = await db.select().from(labTestsTable).where(eq(labTestsTable.id, id)).limit(1);
    return result[0];
  }

  async getLabTestsByLabId(labId: string): Promise<LabTest[]> {
    return await db.select().from(labTestsTable).where(eq(labTestsTable.labId, labId));
  }

  async createLabTest(insertTest: InsertLabTest): Promise<LabTest> {
    const result = await db.insert(labTestsTable).values(insertTest).returning();
    return result[0];
  }

  // Lab Booking operations
  async getLabBooking(id: string): Promise<LabBooking | undefined> {
    const result = await db.select().from(labBookingsTable).where(eq(labBookingsTable.id, id)).limit(1);
    return result[0];
  }

  async getLabBookingsByUserId(userId: string): Promise<LabBooking[]> {
    return await db.select().from(labBookingsTable).where(eq(labBookingsTable.userId, userId));
  }

  async createLabBooking(insertBooking: InsertLabBooking): Promise<LabBooking> {
    const result = await db.insert(labBookingsTable).values(insertBooking).returning();
    return result[0];
  }

  async updateLabBooking(id: string, updates: Partial<LabBooking>): Promise<LabBooking | undefined> {
    const result = await db.update(labBookingsTable)
      .set(updates)
      .where(eq(labBookingsTable.id, id))
      .returning();
    
    return result[0];
  }

  // Doctor operations
  async getDoctor(id: string): Promise<Doctor | undefined> {
    const result = await db.select().from(doctorsTable).where(eq(doctorsTable.id, id)).limit(1);
    return result[0];
  }

  async getDoctors(filters?: { specialization?: string; city?: string }): Promise<Doctor[]> {
    let query = db.select().from(doctorsTable);
    
    if (filters?.specialization) {
      query = query.where(sql`LOWER(${doctorsTable.specialization}) LIKE ${`%${filters.specialization.toLowerCase()}%`}`);
    }
    
    return await query;
  }

  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const result = await db.insert(doctorsTable).values(insertDoctor).returning();
    return result[0];
  }

  // Appointment operations
  async getAppointment(id: string): Promise<Appointment | undefined> {
    const result = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, id)).limit(1);
    return result[0];
  }

  async getAppointmentsByUserId(userId: string): Promise<Appointment[]> {
    return await db.select().from(appointmentsTable).where(eq(appointmentsTable.userId, userId));
  }

  async getAppointmentsByDoctorId(doctorId: string): Promise<Appointment[]> {
    return await db.select().from(appointmentsTable).where(eq(appointmentsTable.doctorId, doctorId));
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const result = await db.insert(appointmentsTable).values(insertAppointment).returning();
    return result[0];
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const result = await db.update(appointmentsTable)
      .set(updates)
      .where(eq(appointmentsTable.id, id))
      .returning();
    
    return result[0];
  }

  // Medicine operations
  async getMedicine(id: string): Promise<Medicine | undefined> {
    const result = await db.select().from(medicinesTable).where(eq(medicinesTable.id, id)).limit(1);
    return result[0];
  }

  async getMedicines(filters?: { name?: string; prescriptionRequired?: boolean }): Promise<Medicine[]> {
    let query = db.select().from(medicinesTable);
    
    if (filters?.name) {
      query = query.where(sql`LOWER(${medicinesTable.name}) LIKE ${`%${filters.name.toLowerCase()}%`}`);
    }
    
    if (filters?.prescriptionRequired !== undefined) {
      query = query.where(eq(medicinesTable.prescriptionRequired, filters.prescriptionRequired));
    }
    
    return await query;
  }

  async createMedicine(insertMedicine: InsertMedicine): Promise<Medicine> {
    const result = await db.insert(medicinesTable).values(insertMedicine).returning();
    return result[0];
  }

  // Order operations
  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
    return result[0];
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return await db.select().from(ordersTable).where(eq(ordersTable.userId, userId));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const result = await db.insert(ordersTable).values(insertOrder).returning();
    return result[0];
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const result = await db.update(ordersTable)
      .set(updates)
      .where(eq(ordersTable.id, id))
      .returning();
    
    return result[0];
  }

  // Prescription operations
  async getPrescription(id: string): Promise<Prescription | undefined> {
    const result = await db.select().from(prescriptionsTable).where(eq(prescriptionsTable.id, id)).limit(1);
    return result[0];
  }

  async getPrescriptionsByUserId(userId: string): Promise<Prescription[]> {
    return await db.select().from(prescriptionsTable).where(eq(prescriptionsTable.userId, userId));
  }

  async getPrescriptionsByDoctorId(doctorId: string): Promise<Prescription[]> {
    return await db.select().from(prescriptionsTable).where(eq(prescriptionsTable.doctorId, doctorId));
  }

  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const result = await db.insert(prescriptionsTable).values(insertPrescription).returning();
    return result[0];
  }

  // Hospital operations
  async getHospital(id: string): Promise<Hospital | undefined> {
    const result = await db.select().from(hospitalsTable).where(eq(hospitalsTable.id, id)).limit(1);
    return result[0];
  }

  async getHospitals(filters?: { city?: string; specialties?: string[] }): Promise<Hospital[]> {
    let query = db.select().from(hospitalsTable);
    
    if (filters?.city) {
      query = query.where(sql`LOWER(${hospitalsTable.city}) LIKE ${`%${filters.city.toLowerCase()}%`}`);
    }
    
    return await query;
  }

  async createHospital(insertHospital: InsertHospital): Promise<Hospital> {
    const result = await db.insert(hospitalsTable).values(insertHospital).returning();
    return result[0];
  }

  // Pharmacy operations
  async getPharmacy(id: string): Promise<Pharmacy | undefined> {
    const result = await db.select().from(pharmaciesTable).where(eq(pharmaciesTable.id, id)).limit(1);
    return result[0];
  }

  async getPharmacies(filters?: { city?: string; deliveryAvailable?: boolean }): Promise<Pharmacy[]> {
    let query = db.select().from(pharmaciesTable);
    
    if (filters?.city) {
      query = query.where(sql`LOWER(${pharmaciesTable.city}) LIKE ${`%${filters.city.toLowerCase()}%`}`);
    }
    
    if (filters?.deliveryAvailable !== undefined) {
      query = query.where(eq(pharmaciesTable.deliveryAvailable, filters.deliveryAvailable));
    }
    
    return await query;
  }

  async createPharmacy(insertPharmacy: InsertPharmacy): Promise<Pharmacy> {
    const result = await db.insert(pharmaciesTable).values(insertPharmacy).returning();
    return result[0];
  }

  // Donor Profile operations
  async getDonorProfile(userId: string): Promise<DonorProfile | undefined> {
    const result = await db.select().from(donorProfilesTable).where(eq(donorProfilesTable.userId, userId)).limit(1);
    return result[0];
  }

  async getDonorProfiles(filters?: { bloodGroup?: string; city?: string; isAvailable?: boolean }): Promise<DonorProfile[]> {
    let query = db.select().from(donorProfilesTable);
    
    if (filters?.bloodGroup) {
      query = query.where(eq(donorProfilesTable.bloodGroup, filters.bloodGroup));
    }
    
    if (filters?.isAvailable !== undefined) {
      query = query.where(eq(donorProfilesTable.isAvailable, filters.isAvailable));
    }
    
    return await query;
  }

  async createDonorProfile(insertProfile: InsertDonorProfile): Promise<DonorProfile> {
    const result = await db.insert(donorProfilesTable).values(insertProfile).returning();
    return result[0];
  }

  async updateDonorProfile(userId: string, updates: Partial<DonorProfile>): Promise<DonorProfile | undefined> {
    const result = await db.update(donorProfilesTable)
      .set(updates)
      .where(eq(donorProfilesTable.userId, userId))
      .returning();
    
    return result[0];
  }

  // Donation operations
  async getDonation(id: string): Promise<Donation | undefined> {
    const result = await db.select().from(donationsTable).where(eq(donationsTable.id, id)).limit(1);
    return result[0];
  }

  async getDonationsByDonorId(donorId: string): Promise<Donation[]> {
    return await db.select().from(donationsTable).where(eq(donationsTable.donorId, donorId));
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const result = await db.insert(donationsTable).values(insertDonation).returning();
    return result[0];
  }

  async updateDonation(id: string, updates: Partial<Donation>): Promise<Donation | undefined> {
    const result = await db.update(donationsTable)
      .set(updates)
      .where(eq(donationsTable.id, id))
      .returning();
    
    return result[0];
  }

  // Donation Request operations
  async getDonationRequest(id: string): Promise<DonationRequest | undefined> {
    const result = await db.select().from(donationRequestsTable).where(eq(donationRequestsTable.id, id)).limit(1);
    return result[0];
  }

  async getDonationRequests(filters?: { bloodGroup?: string; city?: string; urgencyLevel?: string }): Promise<DonationRequest[]> {
    let query = db.select().from(donationRequestsTable);
    
    if (filters?.bloodGroup) {
      query = query.where(eq(donationRequestsTable.bloodGroup, filters.bloodGroup));
    }
    
    if (filters?.urgencyLevel) {
      query = query.where(eq(donationRequestsTable.urgencyLevel, filters.urgencyLevel));
    }
    
    return await query;
  }

  async createDonationRequest(insertRequest: InsertDonationRequest): Promise<DonationRequest> {
    const result = await db.insert(donationRequestsTable).values(insertRequest).returning();
    return result[0];
  }

  async updateDonationRequest(id: string, updates: Partial<DonationRequest>): Promise<DonationRequest | undefined> {
    const result = await db.update(donationRequestsTable)
      .set(updates)
      .where(eq(donationRequestsTable.id, id))
      .returning();
    
    return result[0];
  }

  // Hospital Rating operations
  async getHospitalRating(id: string): Promise<HospitalRating | undefined> {
    const result = await db.select().from(hospitalRatingsTable).where(eq(hospitalRatingsTable.id, id)).limit(1);
    return result[0];
  }

  async getHospitalRatingsByHospitalId(hospitalId: string): Promise<HospitalRating[]> {
    return await db.select().from(hospitalRatingsTable).where(eq(hospitalRatingsTable.hospitalId, hospitalId));
  }

  async createHospitalRating(insertRating: InsertHospitalRating): Promise<HospitalRating> {
    const result = await db.insert(hospitalRatingsTable).values(insertRating).returning();
    return result[0];
  }

  // Doctor Rating operations
  async getDoctorRating(id: string): Promise<DoctorRating | undefined> {
    const result = await db.select().from(doctorRatingsTable).where(eq(doctorRatingsTable.id, id)).limit(1);
    return result[0];
  }

  async getDoctorRatingsByDoctorId(doctorId: string): Promise<DoctorRating[]> {
    return await db.select().from(doctorRatingsTable).where(eq(doctorRatingsTable.doctorId, doctorId));
  }

  async createDoctorRating(insertRating: InsertDoctorRating): Promise<DoctorRating> {
    const result = await db.insert(doctorRatingsTable).values(insertRating).returning();
    return result[0];
  }

  // Vital Signs operations
  async getVitalSigns(id: string): Promise<VitalSigns | undefined> {
    const result = await db.select().from(vitalSignsTable).where(eq(vitalSignsTable.id, id)).limit(1);
    return result[0];
  }

  async getVitalSignsByUserId(userId: string, limit?: number): Promise<VitalSigns[]> {
    let query = db.select().from(vitalSignsTable)
      .where(eq(vitalSignsTable.userId, userId))
      .orderBy(desc(vitalSignsTable.timestamp));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return await query;
  }

  async createVitalSigns(insertVitals: InsertVitalSigns): Promise<VitalSigns> {
    const result = await db.insert(vitalSignsTable).values(insertVitals).returning();
    return result[0];
  }

  // Health Analysis operations
  async getHealthAnalysis(id: string): Promise<HealthAnalysis | undefined> {
    const result = await db.select().from(healthAnalysisTable).where(eq(healthAnalysisTable.id, id)).limit(1);
    return result[0];
  }

  async getHealthAnalysesByUserId(userId: string): Promise<HealthAnalysis[]> {
    return await db.select().from(healthAnalysisTable)
      .where(eq(healthAnalysisTable.userId, userId))
      .orderBy(desc(healthAnalysisTable.timestamp));
  }

  async createHealthAnalysis(insertAnalysis: InsertHealthAnalysis): Promise<HealthAnalysis> {
    const result = await db.insert(healthAnalysisTable).values(insertAnalysis).returning();
    return result[0];
  }
}