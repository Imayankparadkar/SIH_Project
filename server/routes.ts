import type { Express } from "express";
import { createServer, type Server } from "http";
import cors from "cors";
import { authMiddleware, optionalAuth } from "./middleware/auth";
import { storage } from "./storage";
import { predictiveHealthService } from "./services/predictive-health";
import { geminiHealthService } from "./services/gemini";
import { HealthAnalysisRequestSchema, ChatRequestSchema } from "./validation/health";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS configuration
  app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5000",
    credentials: true
  }));

  // Basic API routes
  app.get("/api/auth/status", (req, res) => {
    res.json({ authenticated: false, message: "Auth endpoints not implemented yet" });
  });

  // Enhanced health endpoints for wristband data
  app.get("/api/health/vitals", optionalAuth, (req, res) => {
    res.json({ message: "Health vitals endpoint", data: [] });
  });

  app.post("/api/health/vitals", optionalAuth, async (req, res) => {
    try {
      const vitalSigns = req.body;
      // TODO: Save to database and analyze
      res.json({ success: true, message: "Vital signs received", id: Date.now().toString() });
    } catch (error) {
      res.status(500).json({ error: "Failed to process vital signs" });
    }
  });

  app.post("/api/health/analyze", authMiddleware, async (req, res) => {
    try {
      const validation = HealthAnalysisRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: validation.error.issues 
        });
      }

      const { vitals, userProfile } = validation.data;
      const result = await geminiHealthService.analyzeVitalSigns(
        vitals,
        userProfile.age,
        userProfile.gender,
        userProfile.medicalHistory
      );
      res.json(result);
    } catch (error) {
      console.error('Health analysis error:', error);
      res.status(500).json({ error: "Failed to analyze health data" });
    }
  });

  app.post("/api/health/predict", authMiddleware, async (req, res) => {
    try {
      const { period, historicalData, userProfile } = req.body;
      const prediction = await predictiveHealthService.analyzeLongTermHealthTrends(
        historicalData,
        userProfile,
        period
      );
      res.json({ success: true, prediction });
    } catch (error) {
      console.error('Prediction error:', error);
      res.status(500).json({ error: "Failed to generate health prediction" });
    }
  });

  app.post("/api/health/doctor-report", authMiddleware, async (req, res) => {
    try {
      const { patientData, healthPrediction, recentVitals, labReports } = req.body;
      const report = await predictiveHealthService.generateDoctorReport(
        patientData,
        healthPrediction,
        recentVitals,
        labReports
      );
      res.json({ success: true, report });
    } catch (error) {
      console.error('Doctor report error:', error);
      res.status(500).json({ error: "Failed to generate doctor report" });
    }
  });

  app.get("/api/health/wristband-status", optionalAuth, (req, res) => {
    // Mock wristband device status
    res.json({
      connected: true,
      batteryLevel: 85,
      lastSync: new Date(),
      deviceModel: "HealthBand Pro",
      firmwareVersion: "2.1.0"
    });
  });

  app.get("/api/doctors", optionalAuth, (req, res) => {
    // Mock doctors data
    res.json({
      doctors: [
        {
          id: "doc1",
          name: "Dr. Sarah Johnson",
          specialty: "Cardiology",
          rating: 4.9,
          experience: "15 years",
          hospital: "City General Hospital",
          availability: "Available today",
          consultationFee: 800
        },
        {
          id: "doc2",
          name: "Dr. Rajesh Patel",
          specialty: "Internal Medicine",
          rating: 4.7,
          experience: "12 years",
          hospital: "Metro Health Center",
          availability: "Available tomorrow",
          consultationFee: 600
        },
        {
          id: "doc3",
          name: "Dr. Priya Sharma",
          specialty: "Endocrinology",
          rating: 4.8,
          experience: "18 years",
          hospital: "Advanced Medical Institute",
          availability: "Available next week",
          consultationFee: 900
        }
      ]
    });
  });

  app.post("/api/doctors/send-report", authMiddleware, async (req, res) => {
    try {
      const { doctorId, report, patientData } = req.body;
      // TODO: Send report to doctor
      res.json({
        success: true,
        message: "Report sent to doctor successfully. You will receive a response within 24 hours."
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to send report to doctor" });
    }
  });

  app.get("/api/donations", authMiddleware, (req, res) => {
    res.json({ message: "Donations endpoint", data: [] });
  });

  app.get("/api/emergency/alert", (req, res) => {
    res.json({ message: "Emergency alert endpoint" });
  });

  app.post("/api/emergency/alert", authMiddleware, async (req, res) => {
    try {
      const { type, location, vitalSigns } = req.body;
      // TODO: Handle emergency alert
      console.log('Emergency alert triggered:', { type, location, vitalSigns });
      res.json({ success: true, message: "Emergency services have been notified" });
    } catch (error) {
      res.status(500).json({ error: "Failed to process emergency alert" });
    }
  });

  app.get("/api/reports", authMiddleware, (req, res) => {
    res.json({ message: "Reports endpoint", data: [] });
  });

  // Pathology lab endpoints
  app.get("/api/pathology/labs", authMiddleware, (req, res) => {
    // Mock pathology labs
    res.json({
      labs: [
        { id: "lab1", name: "CityLab Diagnostics", rating: 4.8, distance: "2.3 km" },
        { id: "lab2", name: "HealthCheck Labs", rating: 4.6, distance: "3.1 km" },
        { id: "lab3", name: "MediCore Diagnostics", rating: 4.9, distance: "4.2 km" }
      ]
    });
  });

  app.post("/api/pathology/request", authMiddleware, async (req, res) => {
    try {
      const { testType, labId, urgency } = req.body;
      // TODO: Create pathology test request
      res.json({
        success: true,
        requestId: `REQ-${Date.now()}`,
        message: "Test requested successfully. A technician will contact you within 2 hours.",
        estimatedCollection: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to request pathology test" });
    }
  });

  // Medicine ordering endpoints
  app.get("/api/medicines/search", authMiddleware, (req, res) => {
    const { query } = req.query;
    // Mock medicine search
    res.json({
      medicines: [
        {
          id: "med1",
          name: "Paracetamol 500mg",
          price: 45,
          discountedPrice: 38,
          availability: true,
          prescription: false
        },
        {
          id: "med2",
          name: "Amoxicillin 250mg",
          price: 120,
          discountedPrice: 102,
          availability: true,
          prescription: true
        }
      ]
    });
  });

  app.post("/api/medicines/order", authMiddleware, async (req, res) => {
    try {
      const { medicines, deliveryAddress } = req.body;
      // TODO: Process medicine order
      res.json({
        success: true,
        orderId: `ORD-${Date.now()}`,
        estimatedDelivery: new Date(Date.now() + 48 * 60 * 60 * 1000),
        totalAmount: medicines.reduce((sum: number, med: any) => sum + med.discountedPrice * med.quantity, 0)
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to process medicine order" });
    }
  });

  // AI Chat endpoints
  app.post("/api/chat/doctor", authMiddleware, async (req, res) => {
    try {
      const validation = ChatRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: validation.error.issues 
        });
      }

      const { message, healthContext, userProfile } = validation.data;
      const response = await geminiHealthService.generateChatResponse(
        message,
        healthContext,
        userProfile
      );
      res.json({ success: true, response });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: "Failed to generate chat response" });
    }
  });

  // Health check endpoint
  app.get("/api/status", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
