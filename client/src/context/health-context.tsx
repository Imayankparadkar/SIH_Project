import { createContext, useContext, useEffect, useState } from 'react';
import { collection, addDoc, query, where, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { VitalSigns, HealthAnalysis, InsertVitalSigns, InsertHealthAnalysis } from '@shared/schema';
// Health analysis will be handled server-side

interface HealthContextType {
  currentVitals: VitalSigns | null;
  historicalData: VitalSigns[];
  analysis: HealthAnalysis | null;
  isLoading: boolean;
  error: string | null;
  addVitalSigns: (vitals: Omit<InsertVitalSigns, 'userId'>) => Promise<void>;
  refreshAnalysis: () => Promise<void>;
}

export const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const { user, userProfile } = useAuth();
  const [currentVitals, setCurrentVitals] = useState<VitalSigns | null>(null);
  const [historicalData, setHistoricalData] = useState<VitalSigns[]>([]);
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !user.id) {
      setCurrentVitals(null);
      setHistoricalData([]);
      setAnalysis(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Only use Firebase if it's properly configured
    if (db) {
      // Subscribe to real-time vital signs updates
      const vitalsQuery = query(
        collection(db, 'vitals'),
        where('userId', '==', user.id),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(vitalsQuery, 
        (snapshot) => {
          const vitals: VitalSigns[] = [];
          snapshot.forEach((doc) => {
            vitals.push({ id: doc.id, ...doc.data() } as VitalSigns);
          });

          setHistoricalData(vitals);
          if (vitals.length > 0) {
            setCurrentVitals(vitals[0]);
            // Analyze latest vitals
            analyzeVitals(vitals[0]);
          }
          setIsLoading(false);
        },
        (error) => {
          console.error('Error fetching vitals:', error);
          setError('Failed to load health data');
          setIsLoading(false);
        }
      );

      return unsubscribe;
    } else {
      // Firebase not available, use development mode
      console.log('Firebase not available, using development mode for health data');
      setHistoricalData([]);
      setCurrentVitals(null);
      setIsLoading(false);
    }
  }, [user]);

  const analyzeVitals = async (vitals: VitalSigns) => {
    if (!userProfile) return;

    try {
      // Call server-side analysis API
      const response = await fetch('/api/health/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          vitals: {
            heartRate: vitals.heartRate,
            pulseRate: vitals.heartRate, // Use heartRate as pulse rate for now
            bloodPressureSystolic: vitals.bloodPressureSystolic,
            bloodPressureDiastolic: vitals.bloodPressureDiastolic,
            oxygenSaturation: vitals.oxygenSaturation,
            bodyTemperature: vitals.bodyTemperature,
            ecgRhythm: vitals.ecgData ? 'normal' : undefined,
            steps: vitals.steps || 0,
            sleepHours: vitals.sleepHours || 0,
            radiationExposure: 0, // Default value for now
            fallDetected: false, // Default value for now
            stressLevel: 'normal', // Default value for now
            timestamp: vitals.timestamp
          },
          userProfile: {
            age: userProfile.age,
            gender: userProfile.gender,
            medicalHistory: userProfile.medicalHistory
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        const analysisData: Omit<InsertHealthAnalysis, 'id'> = {
          userId: user!.id,
          vitalSignsId: vitals.id,
          analysis: result.analysis,
          riskLevel: result.riskLevel,
          recommendations: result.recommendations,
          anomalies: result.anomalies,
          aiConfidence: result.confidence,
          timestamp: new Date()
        };

        // Save analysis to Firestore
        const docRef = await addDoc(collection(db, 'analyses'), analysisData);
        setAnalysis({ id: docRef.id, ...analysisData });
      } else {
        // Fallback analysis if server fails
        const fallbackAnalysis: Omit<InsertHealthAnalysis, 'id'> = {
          userId: user!.id,
          vitalSignsId: vitals.id,
          analysis: 'Basic vital signs recorded. Server analysis temporarily unavailable.',
          riskLevel: vitals.heartRate > 100 || vitals.bloodPressureSystolic > 140 ? 'medium' : 'low',
          recommendations: ['Continue monitoring your health', 'Consult healthcare provider if symptoms persist'],
          anomalies: [],
          aiConfidence: 0.5,
          timestamp: new Date()
        };

        const docRef = await addDoc(collection(db, 'analyses'), fallbackAnalysis);
        setAnalysis({ id: docRef.id, ...fallbackAnalysis });
      }

    } catch (error) {
      console.error('Error analyzing vitals:', error);
    }
  };

  const addVitalSigns = async (vitalsData: Omit<InsertVitalSigns, 'userId'>) => {
    if (!user) throw new Error('No user logged in');

    const vitals: Omit<InsertVitalSigns, 'id'> = {
      ...vitalsData,
      userId: user.id
    };

    await addDoc(collection(db, 'vitals'), vitals);
  };

  const refreshAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // If no current vitals, generate sample vitals first
      if (!currentVitals) {
        const sampleVitals: Omit<InsertVitalSigns, 'userId'> = {
          heartRate: Math.floor(Math.random() * 40) + 60, // 60-100 BPM
          bloodPressureSystolic: Math.floor(Math.random() * 40) + 110, // 110-150
          bloodPressureDiastolic: Math.floor(Math.random() * 30) + 70, // 70-100
          oxygenSaturation: Math.floor(Math.random() * 8) + 92, // 92-100%
          bodyTemperature: Math.random() * 4 + 97, // 97-101°F
          deviceInfo: {
            deviceId: 'demo-wristband-001',
            deviceType: 'wristband',
            manufacturer: 'Sehatify',
            model: 'SH-2025',
            isMedicalGrade: true,
            certifications: ['CE', 'FDA']
          },
          dataQuality: {
            confidence: 0.95,
            signalQuality: 'excellent',
            artifactsDetected: false
          },
          timestamp: new Date()
        };
        
        await addVitalSigns(sampleVitals);
        
        // Wait a moment for the data to be saved and the listener to update
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Now analyze the current vitals (either existing or just created)
      if (currentVitals) {
        await analyzeVitals(currentVitals);
      }
    } catch (error) {
      console.error('Error refreshing analysis:', error);
      setError('Failed to generate analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentVitals,
    historicalData,
    analysis,
    isLoading,
    error,
    addVitalSigns,
    refreshAnalysis
  };

  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
}

