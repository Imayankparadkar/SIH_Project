import type { Express } from "express";
import { createServer, type Server } from "http";
import cors from "cors";
import { healthRoutes } from "./routes/health";
import { authRoutes } from "./routes/auth";
import { doctorRoutes } from "./routes/doctors";
import { donationRoutes } from "./routes/donations";
import { emergencyRoutes } from "./routes/emergency";
import { reportRoutes } from "./routes/reports";
import { authMiddleware } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS configuration
  app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5000",
    credentials: true
  }));

  // Public routes
  app.use("/api/auth", authRoutes);
  app.use("/api/emergency", emergencyRoutes);

  // Protected routes (require authentication)
  app.use("/api/health", authMiddleware, healthRoutes);
  app.use("/api/doctors", authMiddleware, doctorRoutes);
  app.use("/api/donations", authMiddleware, donationRoutes);
  app.use("/api/reports", authMiddleware, reportRoutes);

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
