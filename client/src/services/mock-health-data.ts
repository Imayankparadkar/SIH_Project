import { VitalSigns } from '@shared/schema';

export interface MockVitalSigns {
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
  deviceInfo: {
    deviceId: string;
    deviceType: 'wristband' | 'smartwatch' | 'medical_device' | 'manual_entry';
    manufacturer: string;
    model: string;
    isMedicalGrade: boolean;
    certifications?: string[];
    firmwareVersion?: string;
  };
  dataQuality: {
    confidence: number;
    signalQuality: 'excellent' | 'good' | 'fair' | 'poor';
    artifactsDetected: boolean;
  };
  timestamp: Date;
  syncedAt?: Date;
}

export class MockHealthDataService {
  private static instance: MockHealthDataService;
  private intervalId: NodeJS.Timeout | null = null;
  private listeners: Set<(data: MockVitalSigns) => void> = new Set();
  private currentData: MockVitalSigns | null = null;
  private historicalData: MockVitalSigns[] = [];

  static getInstance(): MockHealthDataService {
    if (!MockHealthDataService.instance) {
      MockHealthDataService.instance = new MockHealthDataService();
    }
    return MockHealthDataService.instance;
  }

  private generateRealisticVitals(): MockVitalSigns {
    const now = new Date();
    const timeOfDay = now.getHours();
    
    // Simulate circadian rhythm effects
    const isNight = timeOfDay >= 22 || timeOfDay <= 6;
    const isEvening = timeOfDay >= 18 && timeOfDay < 22;
    
    // Base values with time-of-day variations
    let baseHeartRate = 72;
    let baseSystolic = 120;
    let baseDiastolic = 80;
    let baseTemp = 98.6;
    let baseSteps = Math.floor((timeOfDay / 24) * 12000); // Accumulate steps throughout day
    
    if (isNight) {
      baseHeartRate -= 10; // Lower at night
      baseSystolic -= 5;
      baseDiastolic -= 3;
      baseTemp -= 0.5;
    } else if (isEvening) {
      baseHeartRate += 5; // Slightly higher in evening
      baseTemp += 0.3;
    }
    
    // Add realistic variations
    const heartRate = Math.max(50, Math.min(120, baseHeartRate + (Math.random() - 0.5) * 20));
    const systolic = Math.max(90, Math.min(180, baseSystolic + (Math.random() - 0.5) * 30));
    const diastolic = Math.max(60, Math.min(110, baseDiastolic + (Math.random() - 0.5) * 20));
    const oxygenSaturation = Math.max(92, Math.min(100, 98 + (Math.random() - 0.5) * 6));
    const bodyTemperature = Math.max(96.5, Math.min(100.5, baseTemp + (Math.random() - 0.5) * 2));
    
    // Sleep hours calculation
    const sleepHours = isNight ? Math.random() * 2 + 6 : Math.random() * 1 + 7; // More sleep at night
    
    // Generate ECG pattern
    const ecgPattern = this.generateECGPattern();
    
    return {
      id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: 'demo-user-1',
      heartRate: Math.round(heartRate),
      bloodPressureSystolic: Math.round(systolic),
      bloodPressureDiastolic: Math.round(diastolic),
      oxygenSaturation: Math.round(oxygenSaturation),
      bodyTemperature: Math.round(bodyTemperature * 10) / 10,
      ecgData: ecgPattern,
      steps: baseSteps + Math.floor(Math.random() * 1000),
      sleepHours: Math.round(sleepHours * 10) / 10,
      deviceInfo: {
        deviceId: 'SH-WB-001',
        deviceType: 'wristband',
        manufacturer: 'SehatifyTech',
        model: 'HealthBand Pro',
        isMedicalGrade: true,
        certifications: ['FDA', 'CE', 'ISO_13485'],
        firmwareVersion: '2.4.1'
      },
      dataQuality: {
        confidence: 0.85 + Math.random() * 0.15,
        signalQuality: this.getRandomSignalQuality(),
        artifactsDetected: Math.random() < 0.05 // 5% chance of artifacts
      },
      timestamp: now,
      syncedAt: now
    };
  }

  private generateECGPattern(): string {
    // Generate a realistic ECG pattern (simplified)
    const pattern = [];
    const basePattern = [0.1, 0.2, 0.8, 1.2, 0.4, 0.0, -0.3, 0.1, 0.1];
    
    for (let i = 0; i < basePattern.length; i++) {
      const variation = (Math.random() - 0.5) * 0.1;
      pattern.push((basePattern[i] + variation).toFixed(2));
    }
    
    return pattern.join(',');
  }

  private getRandomSignalQuality(): 'excellent' | 'good' | 'fair' | 'poor' {
    const rand = Math.random();
    if (rand < 0.7) return 'excellent';
    if (rand < 0.9) return 'good';
    if (rand < 0.98) return 'fair';
    return 'poor';
  }

  startRealTimeUpdates(intervalMs: number = 15000): void {
    console.log('MockHealthDataService: Starting real-time updates with interval:', intervalMs);
    this.stopRealTimeUpdates();
    
    // Generate initial data
    this.currentData = this.generateRealisticVitals();
    this.historicalData.unshift(this.currentData);
    console.log('MockHealthDataService: Generated initial data:', this.currentData);
    this.notifyListeners(this.currentData);
    
    // Set up interval for updates
    this.intervalId = setInterval(() => {
      this.currentData = this.generateRealisticVitals();
      this.historicalData.unshift(this.currentData);
      
      // Keep only last 50 readings
      if (this.historicalData.length > 50) {
        this.historicalData = this.historicalData.slice(0, 50);
      }
      
      console.log('MockHealthDataService: Generated new data:', {
        heartRate: this.currentData.heartRate,
        bloodPressure: `${this.currentData.bloodPressureSystolic}/${this.currentData.bloodPressureDiastolic}`,
        timestamp: this.currentData.timestamp
      });
      this.notifyListeners(this.currentData);
    }, intervalMs);
  }

  stopRealTimeUpdates(): void {
    console.log('MockHealthDataService: Stopping real-time updates');
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  subscribe(listener: (data: MockVitalSigns) => void): () => void {
    console.log('MockHealthDataService: New subscriber added. Current listeners:', this.listeners.size + 1);
    this.listeners.add(listener);
    
    // Send current data immediately if available
    if (this.currentData) {
      console.log('MockHealthDataService: Sending current data to new subscriber');
      listener(this.currentData);
    }
    
    return () => {
      console.log('MockHealthDataService: Subscriber removed');
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(data: MockVitalSigns): void {
    console.log('MockHealthDataService: Notifying', this.listeners.size, 'listeners');
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('MockHealthDataService: Error notifying listener:', error);
      }
    });
  }

  getCurrentVitals(): MockVitalSigns | null {
    return this.currentData;
  }

  getHistoricalData(limit: number = 20): MockVitalSigns[] {
    return this.historicalData.slice(0, limit);
  }

  // Generate sample historical data for charts
  generateHistoricalData(days: number = 7): MockVitalSigns[] {
    const data: MockVitalSigns[] = [];
    const now = new Date();
    
    for (let i = days * 24; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000)); // Go back hour by hour
      
      // Skip some hours to make it more realistic
      if (Math.random() < 0.3) continue;
      
      const vitals = this.generateRealisticVitals();
      vitals.timestamp = timestamp;
      vitals.syncedAt = timestamp;
      vitals.id = `historical-${timestamp.getTime()}-${Math.random().toString(36).substr(2, 9)}`;
      
      data.push(vitals);
    }
    
    return data.reverse(); // Oldest first
  }

  // Simulate device status
  getDeviceStatus() {
    return {
      connected: Math.random() > 0.1, // 90% chance of being connected
      batteryLevel: Math.floor(Math.random() * 40) + 60, // 60-100%
      lastSync: new Date(Date.now() - Math.random() * 300000), // Last 5 minutes
      deviceModel: 'HealthBand Pro',
      firmwareVersion: '2.4.1'
    };
  }

  // Simulate health emergencies (rare)
  simulateEmergency(): boolean {
    return Math.random() < 0.001; // 0.1% chance
  }

  // Health score calculation
  calculateHealthScore(vitals: MockVitalSigns): number {
    let score = 0;
    const weights = { heartRate: 0.25, bloodPressure: 0.30, oxygen: 0.25, temperature: 0.20 };
    
    // Heart rate scoring (60-100 BPM is optimal)
    if (vitals.heartRate >= 60 && vitals.heartRate <= 100) {
      score += 100 * weights.heartRate;
    } else if (vitals.heartRate >= 50 && vitals.heartRate <= 120) {
      score += 70 * weights.heartRate;
    } else {
      score += 40 * weights.heartRate;
    }

    // Blood pressure scoring (120/80 or lower is optimal)
    if (vitals.bloodPressureSystolic <= 120 && vitals.bloodPressureDiastolic <= 80) {
      score += 100 * weights.bloodPressure;
    } else if (vitals.bloodPressureSystolic <= 140 && vitals.bloodPressureDiastolic <= 90) {
      score += 70 * weights.bloodPressure;
    } else {
      score += 40 * weights.bloodPressure;
    }

    // Oxygen saturation scoring (95% or higher is optimal)
    if (vitals.oxygenSaturation >= 95) {
      score += 100 * weights.oxygen;
    } else if (vitals.oxygenSaturation >= 90) {
      score += 70 * weights.oxygen;
    } else {
      score += 40 * weights.oxygen;
    }

    // Temperature scoring (97-99.5°F is optimal)
    if (vitals.bodyTemperature >= 97 && vitals.bodyTemperature <= 99.5) {
      score += 100 * weights.temperature;
    } else {
      score += 60 * weights.temperature;
    }

    return Math.round(score);
  }
}

// Export singleton instance
export const mockHealthService = MockHealthDataService.getInstance();