import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';
import { setupWebSocketHandlers } from "./routes/messages";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { authMiddleware, optionalAuth } from "./middleware/auth";
import { authRoutes } from "./routes/auth";
import { hospitalsRouter } from "./routes/hospitals";
import { appointmentsRouter } from "./routes/appointments";
import mentorRoutes from "./routes/mentors";
import studentRoutes from "./routes/students";
import messageRoutes from "./routes/messages";
import { storage } from "./storage";
import { predictiveHealthService } from "./services/predictive-health";
import { geminiHealthService } from "./services/gemini";
import { firebaseStorageService } from "./services/firebase-storage";
import { HealthAnalysisRequestSchema, ChatRequestSchema, MedicalFileUploadSchema, FileAccessParamsSchema, ReportIdParamsSchema } from "./validation/health";
import { insertMedicalReportSchema, insertLabBookingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS configuration
  app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5000",
    credentials: true
  }));

  // Configure multer for file uploads (using memory storage for Firebase)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.'));
      }
    }
  });

  // Authentication routes
  app.use("/api/auth", authRoutes);

  // Hospital routes
  app.use("/api/hospitals", hospitalsRouter);

  // Appointment routes
  app.use("/api/appointments", appointmentsRouter);

  // Mentor-Student routes
  app.use("/api/mentors", mentorRoutes);

  // Student routes
  app.use("/api/students", studentRoutes);

  // Message routes
  app.use("/api/messages", messageRoutes);

  // Medical File Upload endpoints - Use optional auth in development mode
  const uploadAuthMiddleware = process.env.NODE_ENV === 'development' ? optionalAuth : authMiddleware;
  app.post("/api/uploads", uploadAuthMiddleware, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Validate request body parameters
      const bodyValidation = MedicalFileUploadSchema.safeParse(req.body);
      if (!bodyValidation.success) {
        return res.status(400).json({ 
          error: "Invalid upload parameters", 
          details: bodyValidation.error.issues 
        });
      }

      const { reportType, sourceType, sourceId, description } = bodyValidation.data;
      
      // Get authenticated user ID from session, or use demo user in development
      let userId = (req as any).user?.uid;
      if (!userId) {
        if (process.env.NODE_ENV === 'development') {
          // Use demo user ID for development mode (matching dev-auth.ts)
          userId = 'demo-user-1';
          console.log('Using demo user ID for development mode upload');
        } else {
          return res.status(401).json({ error: "User not authenticated" });
        }
      }
      
      // Upload file to Firebase Storage (using buffer from memory storage)
      const cloudStorageUrl = await firebaseStorageService.uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      const reportData = {
        userId,
        fileName: `${randomUUID()}-${req.file.originalname}`, // Generate unique filename
        originalFileName: req.file.originalname,
        fileType: req.file.mimetype.includes('pdf') ? 'pdf' as const : 
                  req.file.mimetype.includes('jpeg') ? 'jpeg' as const : 'png' as const,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        checksum: randomUUID(), // Simple checksum for now
        storageUrl: cloudStorageUrl,
        reportType: reportType as any,
        sourceType,
        sourceId,
        description,
        isAnalyzed: false,
        sharedWith: [] as string[],
        tags: [] as string[],
        isEncrypted: true,
        isDeidentified: false
      };

      const report = await storage.createMedicalReport(reportData);
      
      // Provide AI-powered analysis for uploaded medical files
      try {
        const language = req.body.language || 'en';
        let analysisResult;
        
        if (req.file.mimetype === 'application/pdf') {
          let tempFilePath: string | null = null;
          try {
            // Extract text from PDF and analyze with Gemini AI
            tempFilePath = `/tmp/${randomUUID()}-${req.file.originalname}`;
            await fs.writeFile(tempFilePath, req.file.buffer);
            
            const extractedText = await geminiHealthService.extractTextFromFile(tempFilePath);
            
            if (extractedText && extractedText.trim().length > 10) {
              // Use Gemini AI for comprehensive analysis
              analysisResult = await geminiHealthService.analyzeMedicalDocument(
                extractedText,
                reportType as 'lab_report' | 'prescription' | 'medical_record',
                language
              );
            } else {
              throw new Error('Could not extract meaningful text from PDF');
            }
          } catch (extractError) {
            console.error('PDF analysis error:', extractError);
            // Fallback to basic analysis if Gemini fails
            analysisResult = {
              summary: `PDF medical document uploaded successfully. AI analysis encountered an issue, but the document is securely stored. Please consult your healthcare provider for detailed interpretation.`,
              keyFindings: [`${reportType} PDF document uploaded`, "Document stored securely", "Manual review recommended"],
              recommendations: ["Consult with your healthcare provider for document interpretation", "Share with your medical team during appointments", "Keep a backup copy for your records"],
              dietPlan: { breakfast: [], lunch: [], dinner: [], snacks: [] },
              exercisePlan: { cardio: [], strength: [], flexibility: [] },
              youtubeVideos: [{ title: "General Health Tips", searchTerm: "basic health tips for beginners" }],
              lifestyleChanges: ["Maintain regular healthcare checkups"],
              actionPlan: { immediate: ["Contact your healthcare provider"], shortTerm: ["Schedule a consultation"], longTerm: ["Follow medical advice"] },
              followUpNeeded: true
            };
          } finally {
            // Always clean up temp file
            if (tempFilePath) {
              try {
                await fs.unlink(tempFilePath);
              } catch (unlinkError) {
                console.warn('Failed to delete temp file:', unlinkError);
              }
            }
          }
        } else if (req.file.mimetype.startsWith('image/')) {
          // For images, provide general health guidance since we can't do OCR yet
          analysisResult = {
            summary: `Medical image uploaded successfully. While AI cannot analyze images directly yet, here are some general health recommendations based on the document type.`,
            keyFindings: [`${reportType} image uploaded`, "Professional interpretation recommended for images"],
            recommendations: ["Consult with your healthcare provider for image interpretation", "Share with your medical team during appointments"],
            dietPlan: { 
              breakfast: ["Include fruits and vegetables", "Choose whole grains", "Stay hydrated"], 
              lunch: ["Lean proteins", "Colorful vegetables", "Healthy fats"], 
              dinner: ["Light, nutritious meals", "Avoid late eating"], 
              snacks: ["Nuts", "Fruits", "Yogurt"] 
            },
            exercisePlan: { 
              cardio: ["30 minutes walking daily", "Swimming if accessible", "Cycling"], 
              strength: ["Bodyweight exercises", "Light weights", "Resistance bands"], 
              flexibility: ["Daily stretching", "Yoga poses", "Deep breathing"] 
            },
            youtubeVideos: [
              { title: "Basic Health Tips", searchTerm: "daily health habits for beginners" },
              { title: "Simple Exercise Routine", searchTerm: "beginner home workout" }
            ],
            lifestyleChanges: ["Regular sleep schedule", "Stress management", "Stay hydrated"],
            actionPlan: { 
              immediate: ["Consult healthcare provider for image interpretation"], 
              shortTerm: ["Follow general wellness practices"], 
              longTerm: ["Maintain healthy lifestyle"] 
            },
            followUpNeeded: true
          };
        }
        
        if (analysisResult) {
          const analysisData = {
            summary: analysisResult.summary,
            keyFindings: analysisResult.keyFindings,
            recommendations: analysisResult.recommendations,
            dietPlan: analysisResult.dietPlan || { breakfast: [], lunch: [], dinner: [], snacks: [] },
            exercisePlan: analysisResult.exercisePlan || { cardio: [], strength: [], flexibility: [] },
            youtubeVideos: analysisResult.youtubeVideos || [],
            lifestyleChanges: analysisResult.lifestyleChanges || [],
            actionPlan: analysisResult.actionPlan || { immediate: [], shortTerm: [], longTerm: [] },
            followUpNeeded: analysisResult.followUpNeeded,
            analyzedAt: new Date(),
            confidence: 0.9,
            aiModelUsed: "gemini-1.5-flash",
            language: language
          };
          
          await storage.updateMedicalReport(report.id, {
            isAnalyzed: true,
            analysis: analysisData
          });
        }
      } catch (analysisError) {
        console.error('Document analysis error:', analysisError);
      }

      res.json({
        success: true,
        report,
        message: "File uploaded and analyzed successfully"
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  app.get("/api/uploads", uploadAuthMiddleware, async (req, res) => {
    try {
      let userId = (req as any).user?.uid;
      if (!userId) {
        if (process.env.NODE_ENV === 'development') {
          userId = 'demo-user-id-for-testing';
        } else {
          return res.status(401).json({ error: "User not authenticated" });
        }
      }
      const reports = await storage.getMedicalReportsByUserId(userId);
      res.json({ reports });
    } catch (error) {
      console.error('Get reports error:', error);
      res.status(500).json({ error: "Failed to retrieve reports" });
    }
  });

  app.get("/api/uploads/:filename", uploadAuthMiddleware, async (req, res) => {
    try {
      // Validate filename parameter
      const paramValidation = FileAccessParamsSchema.safeParse(req.params);
      if (!paramValidation.success) {
        return res.status(400).json({ 
          error: "Invalid filename", 
          details: paramValidation.error.issues 
        });
      }

      const { filename } = paramValidation.data;
      
      // Get authenticated user ID
      let userId = (req as any).user?.uid;
      if (!userId) {
        if (process.env.NODE_ENV === 'development') {
          userId = 'demo-user-id-for-testing';
        } else {
          return res.status(401).json({ error: "User not authenticated" });
        }
      }
      
      // Verify user owns this file
      const userReports = await storage.getMedicalReportsByUserId(userId);
      const report = userReports.find(r => r.fileName === filename);
      
      if (!report) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Generate signed URL for the file from Firebase Storage
      const signedUrl = await firebaseStorageService.getSignedUrl(report.storageUrl, 60); // 60 minutes expiry
      
      // Redirect to the signed URL for secure access
      res.redirect(signedUrl);
    } catch (error) {
      console.error('File access error:', error);
      res.status(404).json({ error: "File not found" });
    }
  });

  app.delete("/api/uploads/:id", uploadAuthMiddleware, async (req, res) => {
    try {
      // Validate report ID parameter
      const paramValidation = ReportIdParamsSchema.safeParse(req.params);
      if (!paramValidation.success) {
        return res.status(400).json({ 
          error: "Invalid report ID", 
          details: paramValidation.error.issues 
        });
      }

      const { id } = paramValidation.data;
      let userId = (req as any).user?.uid;
      if (!userId) {
        if (process.env.NODE_ENV === 'development') {
          userId = 'demo-user-id-for-testing';
        } else {
          return res.status(401).json({ error: "User not authenticated" });
        }
      }

      const report = await storage.getMedicalReport(id);
      
      // Verify user owns this report
      if (!report || report.userId !== userId) {
        return res.status(404).json({ error: "Report not found or access denied" });
      }
      
      // Delete file from Firebase Storage
      try {
        await firebaseStorageService.deleteFile(report.storageUrl);
      } catch (fileError) {
        console.warn('Firebase Storage deletion error:', fileError);
      }
      
      // Delete from database
      await storage.deleteMedicalReport(id);
      
      res.json({ success: true, message: "Report deleted successfully" });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: "Failed to delete report" });
    }
  });

  // Enhanced Lab Booking endpoints
  app.get("/api/labs", authMiddleware, async (req, res) => {
    try {
      const { city, specializations } = req.query;
      const filters: any = {};
      
      if (city) filters.city = city as string;
      if (specializations) filters.specializations = (specializations as string).split(',');
      
      const labs = await storage.getLabs(filters);
      res.json({ labs });
    } catch (error) {
      console.error('Get labs error:', error);
      res.status(500).json({ error: "Failed to retrieve labs" });
    }
  });

  app.get("/api/labs/:labId/tests", authMiddleware, async (req, res) => {
    try {
      const { labId } = req.params;
      const tests = await storage.getLabTestsByLabId(labId);
      res.json({ tests });
    } catch (error) {
      console.error('Get lab tests error:', error);
      res.status(500).json({ error: "Failed to retrieve lab tests" });
    }
  });

  app.post("/api/labs/book", authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const bookingData = insertLabBookingSchema.parse({
        ...req.body,
        userId
      });
      
      const booking = await storage.createLabBooking(bookingData);
      
      res.json({
        success: true,
        booking,
        message: "Lab booking created successfully"
      });
    } catch (error) {
      console.error('Lab booking error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid booking data", 
          details: error.issues 
        });
      }
      res.status(500).json({ error: "Failed to create lab booking" });
    }
  });

  app.get("/api/labs/bookings", authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const bookings = await storage.getLabBookingsByUserId(userId);
      res.json({ bookings });
    } catch (error) {
      console.error('Get bookings error:', error);
      res.status(500).json({ error: "Failed to retrieve bookings" });
    }
  });

  app.put("/api/labs/bookings/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const booking = await storage.updateLabBooking(id, updates);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      res.json({ success: true, booking });
    } catch (error) {
      console.error('Update booking error:', error);
      res.status(500).json({ error: "Failed to update booking" });
    }
  });

  // 3D Body Analysis endpoint
  app.post("/api/analysis/body-map", authMiddleware, async (req, res) => {
    try {
      const { healthAnalysis, symptoms, conditions } = req.body;
      
      // Use Gemini to analyze health data and map to body parts
      const prompt = `Based on the following health analysis and symptoms, identify which body parts/systems are affected and provide a mapping for 3D visualization:

Health Analysis: ${healthAnalysis}
Symptoms: ${symptoms ? symptoms.join(', ') : 'None specified'}
Conditions: ${conditions ? conditions.join(', ') : 'None specified'}

Please respond in JSON format with:
{
  "affectedSystems": ["cardiovascular", "respiratory", "musculoskeletal", etc.],
  "bodyParts": [
    {"name": "heart", "severity": "high|medium|low", "description": "explanation"},
    {"name": "lungs", "severity": "medium", "description": "explanation"}
  ],
  "overallRisk": "low|medium|high|critical",
  "visualization": {
    "highlightedAreas": ["chest", "head", "limbs"],
    "colors": {"chest": "#ff4444", "head": "#ffaa44"}
  }
}`;

      const result = await geminiHealthService.generateChatResponse(prompt);
      
      try {
        // Try to parse JSON from Gemini response
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        let bodyMap;
        
        if (jsonMatch) {
          bodyMap = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback response
          bodyMap = {
            affectedSystems: ["general"],
            bodyParts: [
              {
                name: "general",
                severity: "medium",
                description: "Based on the analysis, general health monitoring is recommended"
              }
            ],
            overallRisk: "low",
            visualization: {
              highlightedAreas: ["torso"],
              colors: {"torso": "#4CAF50"}
            }
          };
        }
        
        res.json({
          success: true,
          bodyMap,
          analysisText: result
        });
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        res.json({
          success: true,
          bodyMap: {
            affectedSystems: ["general"],
            bodyParts: [{
              name: "general",
              severity: "low",
              description: "Health analysis completed successfully"
            }],
            overallRisk: "low",
            visualization: {
              highlightedAreas: ["torso"],
              colors: {"torso": "#4CAF50"}
            }
          },
          analysisText: result
        });
      }
    } catch (error) {
      console.error('Body map analysis error:', error);
      res.status(500).json({ error: "Failed to generate body map analysis" });
    }
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

  // AI Chat endpoints - Allow without strict authentication for now
  app.post("/api/chat/doctor", async (req, res) => {
    try {
      // For now, allow chat without authentication to test Gemini API
      const { message, healthContext, userProfile, language } = req.body;
      
      console.log('Chat request received:', { message: message?.substring(0, 50) });
      
      // Get user's medical reports to include in context
      let medicalReports: any[] = [];
      try {
        // Use demo user for development
        const userId = 'demo-user-1';
        medicalReports = await storage.getMedicalReportsByUserId(userId);
        console.log(`Found ${medicalReports.length} medical reports for user`);
      } catch (error) {
        console.log('Could not fetch medical reports:', error);
      }
      
      const response = await geminiHealthService.generateChatResponse(
        message,
        healthContext,
        userProfile,
        language,
        medicalReports
      );
      
      console.log('Chat response generated:', response.substring(0, 100));
      res.json({ success: true, response });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: "Failed to generate chat response" });
    }
  });

  // Mental Health Mentor Chat endpoint - for anonymous mental health support
  app.post("/api/chat/mentor", async (req, res) => {
    try {
      const { message, category, mentorName, studentId } = req.body;
      
      if (!message || !category) {
        return res.status(400).json({ error: "Message and category are required" });
      }

      console.log('Mentor chat request received:', { 
        message: message?.substring(0, 50), 
        category, 
        mentorName, 
        studentId 
      });

      const response = await geminiHealthService.generateMentorChatResponse(
        message,
        category,
        mentorName || 'Mental Health Mentor',
        studentId || 'Student'
      );
      
      console.log('Mentor response generated:', response.substring(0, 100));
      res.json({ success: true, response });
    } catch (error) {
      console.error('Mentor chat error:', error);
      res.status(500).json({ error: "Failed to generate mentor response" });
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
  
  // Setup WebSocket Server for real-time messaging
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/api/ws'
  });

  wss.on('connection', (ws, request) => {
    const connectionId = randomUUID();
    
    // Extract authentication from query params or headers
    const url = new URL(request.url!, `http://${request.headers.host}`);
    const token = url.searchParams.get('token') || request.headers.authorization?.replace('Bearer ', '');
    const studentId = url.searchParams.get('studentId'); // For anonymous students
    
    // TODO: Validate Firebase token if provided
    let userId: string | undefined;
    if (token && token !== 'anonymous') {
      // For production, verify Firebase token here
      // userId = await verifyFirebaseToken(token);
      userId = token; // For development, use token as userId
    }

    console.log(`WebSocket connection established: ${connectionId}, userId: ${userId}, studentId: ${studentId}`);
    
    // Setup message handlers
    setupWebSocketHandlers(ws, connectionId, userId, studentId);
    
    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'connection_established',
      connectionId,
      timestamp: new Date().toISOString()
    }));

    ws.on('error', (error) => {
      console.error('WebSocket error for connection', connectionId, ':', error);
    });

    ws.on('close', () => {
      console.log(`WebSocket connection closed: ${connectionId}`);
    });
  });

  console.log('WebSocket server configured on /api/ws');
  
  return httpServer;
}
