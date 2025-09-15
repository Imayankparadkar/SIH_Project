export interface VitalSigns {
  id: string;
  userId: string;
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  oxygenSaturation: number;
  bodyTemperature: number;
  ecgData?: string;
  steps?: number;
  sleepHours?: number;
  timestamp: Date;
}

export interface HealthAnalysis {
  id: string;
  userId: string;
  vitalSignsId: string;
  analysis: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  anomalies?: string[];
  aiConfidence: number;
  timestamp: Date;
}

export interface HealthMetrics {
  averageHeartRate: number;
  averageBloodPressure: string;
  averageOxygenSaturation: number;
  averageTemperature: number;
  totalSteps: number;
  averageSleepHours: number;
}

export interface HealthTrend {
  metric: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  period: string;
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  type: 'medical' | 'fall' | 'abnormal_vitals' | 'manual';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  vitalSigns?: {
    heartRate?: number;
    bloodPressure?: string;
    oxygenSaturation?: number;
  };
  status: 'active' | 'resolved' | 'false_alarm';
  timestamp: Date;
}

export interface WearableDevice {
  id: string;
  userId: string;
  deviceType: string;
  serialNumber: string;
  isConnected: boolean;
  batteryLevel: number;
  lastSync: Date;
  firmwareVersion: string;
}
