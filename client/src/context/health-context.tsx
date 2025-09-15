import { createContext, useContext, useEffect, useState } from 'react';
import { collection, addDoc, query, where, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './auth-context';
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
    if (!user) {
      setCurrentVitals(null);
      setHistoricalData([]);
      setAnalysis(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Subscribe to real-time vital signs updates
    const vitalsQuery = query(
      collection(db, 'vitals'),
      where('userId', '==', user.uid),
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
          userId: user!.uid,
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
          userId: user!.uid,
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
      userId: user.uid
    };

    await addDoc(collection(db, 'vitals'), vitals);
  };

  const refreshAnalysis = async () => {
    if (currentVitals) {
      await analyzeVitals(currentVitals);
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

export function useHealth() {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
}
