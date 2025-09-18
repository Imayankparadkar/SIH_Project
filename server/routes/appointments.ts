import { Router } from 'express';
import { DbStorage } from '../db-storage';
import { z } from 'zod';

const router = Router();
const dbStorage = new DbStorage();

// Appointment booking schema
const bookAppointmentSchema = z.object({
  doctorId: z.string(),
  appointmentType: z.enum(['video_call', 'clinic_visit', 'home_visit']),
  scheduledDateTime: z.string(),
  symptoms: z.string().optional(),
  patientInfo: z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string().email(),
    age: z.number().optional()
  })
});

// POST /api/appointments - Book a new appointment
router.post('/', async (req, res) => {
  try {
    const validationResult = bookAppointmentSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid appointment data', 
        details: validationResult.error.issues 
      });
    }
    
    const appointmentData = validationResult.data;
    
    // Check if doctor exists (using same mock data as /api/doctors)
    const mockDoctors = [
      {
        id: "doc1",
        name: "Dr. Sarah Johnson",
        specialization: "Cardiology",
        rating: 4.9,
        experience: "15 years",
        hospitalAffiliation: "City General Hospital",
        consultationFee: 800
      },
      {
        id: "doc2",
        name: "Dr. Rajesh Patel",
        specialization: "Internal Medicine",
        rating: 4.7,
        experience: "12 years",
        hospitalAffiliation: "Metro Health Center",
        consultationFee: 600
      },
      {
        id: "doc3",
        name: "Dr. Priya Sharma",
        specialization: "Endocrinology",
        rating: 4.8,
        experience: "18 years",
        hospitalAffiliation: "Advanced Medical Institute",
        consultationFee: 900
      }
    ];
    const doctor = mockDoctors.find(d => d.id === appointmentData.doctorId);
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // Get demo user from database (in production, get from authenticated user)
    const demoUser = await dbStorage.getUserByEmail('demo@sehatify.com');
    if (!demoUser) {
      return res.status(400).json({ error: 'Demo user not found' });
    }

    // Create appointment
    const appointment = {
      userId: demoUser.id,
      doctorId: appointmentData.doctorId,
      appointmentType: appointmentData.appointmentType,
      scheduledDateTime: new Date(appointmentData.scheduledDateTime),
      timezone: 'Asia/Kolkata',
      duration: 30,
      consultationFee: doctor.consultationFee,
      status: 'scheduled' as const,
      paymentStatus: 'pending' as const,
      symptoms: appointmentData.symptoms,
      medicalReports: [],
      followUpRequired: false,
      bookedAt: new Date()
    };
    
    const newAppointment = await dbStorage.createAppointment(appointment);
    
    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: newAppointment,
      doctor: {
        name: doctor.name,
        specialization: doctor.specialization,
        hospitalAffiliation: doctor.hospitalAffiliation
      }
    });
    
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// GET /api/appointments - Get user appointments
router.get('/', async (req, res) => {
  try {
    // In production, get userId from authenticated session
    const userId = 'demo-user-id';
    
    const appointments = await dbStorage.getAppointmentsByUserId(userId);
    
    // Get doctor details for each appointment
    const doctors = await dbStorage.getDoctors();
    const appointmentsWithDoctors = appointments.map((appointment: any) => {
      const doctor = doctors.find(d => d.id === appointment.doctorId);
      return {
        ...appointment,
        doctor: doctor ? {
          name: doctor.name,
          specialization: doctor.specialization,
          hospitalAffiliation: doctor.hospitalAffiliation
        } : null
      };
    });
    
    res.json(appointmentsWithDoctors);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// PUT /api/appointments/:id/cancel - Cancel an appointment
router.put('/:id/cancel', async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { cancellationReason } = req.body;
    
    const appointment = await dbStorage.getAppointment(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Appointment is already cancelled' });
    }
    
    await dbStorage.updateAppointment(appointmentId, {
      status: 'cancelled',
      cancellationReason: cancellationReason || 'Cancelled by user'
    });
    
    res.json({ message: 'Appointment cancelled successfully' });
    
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

export { router as appointmentsRouter };