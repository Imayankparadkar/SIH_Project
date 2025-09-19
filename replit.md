# Health Monitoring Wristband App

## Overview
This is a comprehensive health monitoring platform that integrates with a smart wristband to track and analyze vital health parameters. The application provides real-time health insights, AI-powered analysis, doctor consultations, and emergency features.

## Project Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **UI Framework**: Tailwind CSS + Radix UI components
- **State Management**: React Query (@tanstack/react-query)
- **Routing**: Wouter
- **Database**: Neon PostgreSQL (via @neondatabase/serverless)
- **AI Integration**: Google Gemini AI for health analysis
- **Authentication**: Firebase Auth + Passport.js
- **3D Visualization**: Three.js + React Three Fiber

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React context providers
│   │   ├── lib/           # Utility libraries and configuration
│   │   └── types/         # TypeScript type definitions
├── server/                # Express backend
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic services
│   ├── middleware/        # Express middleware
│   └── validation/        # Request validation schemas
├── shared/                # Shared types and schemas
└── attached_assets/       # 3D models and assets
```

## Core Features

### Health Monitoring
- Real-time vital signs tracking (blood pressure, pulse, oxygen levels)
- Historical health data visualization with charts
- AI-powered health analysis using Gemini
- Predictive health insights and risk assessment

### Medical Services
- Virtual doctor consultations with AI chatbot
- Lab test booking and pathology services
- Medical report upload and analysis
- Doctor appointment scheduling
- Medicine ordering and delivery

### Emergency Features
- SOS emergency alert system
- Automatic emergency contact notification
- Critical health threshold monitoring
- Location-based emergency services

### User Experience
- Multi-language support (i18n)
- Offline capability for core features
- Responsive design for mobile and desktop
- 3D body visualization for health mapping

## Development Setup

### Current Configuration
- **Port**: 5000 (serves both frontend and backend)
- **Host**: 0.0.0.0 (configured for Replit proxy compatibility)
- **Environment**: Development mode with hot module reloading
- **Authentication**: Demo user available (demo@sehatify.com)

### Key Integrations
- **Firebase**: Authentication and real-time data
- **Google Gemini**: AI health analysis and chat responses
- **Neon Database**: PostgreSQL for data persistence
- **Drizzle ORM**: Type-safe database operations

## API Endpoints

### Health & Vitals
- `GET/POST /api/health/vitals` - Vital signs data
- `POST /api/health/analyze` - AI health analysis
- `POST /api/health/predict` - Predictive health insights
- `GET /api/health/wristband-status` - Device status

### Medical Services
- `GET /api/doctors` - Available doctors
- `POST /api/doctors/send-report` - Send report to doctor
- `GET /api/labs` - Available pathology labs
- `POST /api/labs/book` - Book lab tests

### File Management
- `POST /api/uploads` - Upload medical reports
- `GET /api/uploads` - List user reports
- `DELETE /api/uploads/:id` - Delete reports

### Emergency & Chat
- `POST /api/emergency/alert` - Emergency SOS
- `POST /api/chat/doctor` - AI doctor chat

## User Preferences
- Professional healthcare application setup
- Focus on data privacy and HIPAA compliance
- Clean, medical-grade UI/UX design
- Real-time data processing capabilities

## Recent Changes (September 19, 2025)
- **Fresh GitHub Import Completed (Final)**: All systems running successfully
- Resolved tsx dependency installation issue that was preventing startup
- Fixed Firebase Admin initialization and PostgreSQL database connectivity
- Configured Vite for Replit proxy compatibility (host: 0.0.0.0, port: 5000)
- Added allowedHosts: true to Vite config for proper Replit proxy support
- Set up PostgreSQL database and successfully synced schema with `npm run db:push`
- Established unified workflow serving both frontend and backend on port 5000
- Configured webview output type for proper Replit preview functionality
- Configured deployment settings for autoscale production environment
- Verified demo user authentication system (demo@sehatify.com / demo123)
- Confirmed server startup with all services: Express, Firebase, WebSocket, Database
- Fixed browser compatibility issue with global polyfill (global: "globalThis")
- **IMPORT STATUS: COMPLETED SUCCESSFULLY** - Application fully operational in Replit

### Final Import Configuration (September 19, 2025)
- **Frontend**: React + TypeScript with Vite serving on port 5000
- **Backend**: Express.js + TypeScript serving API routes on same port
- **Database**: PostgreSQL with Drizzle ORM - schema successfully pushed
- **Workflow**: Configured with webview output type for proper Replit preview
- **Deployment**: Configured for autoscale with build and start commands
- **Proxy Compatibility**: Vite configured with host: 0.0.0.0, port: 5000, and allowedHosts: true
- **Status**: Application running and API endpoints responding with 200 status codes
- **Demo System**: Available at demo@sehatify.com / demo123
- **Project Import**: COMPLETED SUCCESSFULLY

## Development Notes
- The application uses a unified server approach where Express serves both API routes and the Vite-built frontend
- Demo authentication is available for development
- AI services require proper API keys (Gemini, Firebase)
- Database connection uses Replit PostgreSQL with automatic provisioning
- File uploads are stored locally with database metadata tracking