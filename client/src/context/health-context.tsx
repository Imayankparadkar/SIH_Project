import { createContext, useContext, useEffect, useState } from 'react';
import { collection, addDoc, query, where, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './auth-context';
import { VitalSigns, HealthAnalysis, InsertVitalSigns, InsertHealthAnalysis } from '@shared/schema';
import { geminiAnalyzer } from '@/lib/gemini';

interface HealthContextType {
  currentVitals: VitalSigns | null;
  historicalData: VitalSigns[];
  analysis: HealthAnalysis | null;
  isLoading: boolean;
  error: string | null;
  addVitalSigns: (vitals: Omit<InsertVitalSigns, 'userId'>) => Promise<void>;
  refreshAnalysis: () => Promise<void>;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

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
      const result = await geminiAnalyzer.analyzeVitalSigns(
        {
          heartRate: vitals.heartRate,
          bloodPressureSystolic: vitals.bloodPressureSystolic,
          bloodPressureDiastolic: vitals.bloodPressureDiastolic,
          oxygenSaturation: vitals.oxygenSaturation,
          bodyTemperature: vitals.bodyTemperature,
          timestamp: vitals.timestamp
        },
        userProfile.age,
        userProfile.gender
      );

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
