import { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, InsertUserProfile } from '@shared/schema';

interface DevUser {
  id: string;
  email: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  medicalHistory?: string;
  abhaId?: string;
  language: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: DevUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, profileData: Omit<InsertUserProfile, 'email'>) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to make API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`/api/auth${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DevUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await apiCall('/me');
          if (response.success && response.user) {
            setUser(response.user);
            // Convert user to UserProfile format
            setUserProfile({
              id: response.user.id,
              email: response.user.email,
              name: response.user.name,
              age: response.user.age,
              gender: response.user.gender,
              phone: response.user.phone,
              medicalHistory: response.user.medicalHistory,
              abhaId: response.user.abhaId,
              language: response.user.language,
              country: response.user.country,
              createdAt: new Date(response.user.createdAt),
              updatedAt: new Date(response.user.updatedAt)
            } as UserProfile);
          } else {
            // Invalid token, remove it
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiCall('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.user && response.token) {
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      
      // Convert user to UserProfile format
      setUserProfile({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        age: response.user.age,
        gender: response.user.gender,
        phone: response.user.phone,
        medicalHistory: response.user.medicalHistory,
        abhaId: response.user.abhaId,
        language: response.user.language,
        country: response.user.country,
        createdAt: new Date(response.user.createdAt),
        updatedAt: new Date(response.user.updatedAt)
      } as UserProfile);
    } else {
      throw new Error('Login failed');
    }
  };

  const register = async (email: string, password: string, profileData: Omit<InsertUserProfile, 'email'>) => {
    const response = await apiCall('/register', {
      method: 'POST',
      body: JSON.stringify({ 
        email, 
        password, 
        ...profileData 
      }),
    });

    if (response.success && response.user && response.token) {
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      
      // Convert user to UserProfile format
      setUserProfile({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        age: response.user.age,
        gender: response.user.gender,
        phone: response.user.phone,
        medicalHistory: response.user.medicalHistory,
        abhaId: response.user.abhaId,
        language: response.user.language,
        country: response.user.country,
        createdAt: new Date(response.user.createdAt),
        updatedAt: new Date(response.user.updatedAt)
      } as UserProfile);
    } else {
      throw new Error('Registration failed');
    }
  };

  const logout = async () => {
    try {
      await apiCall('/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    
    // Clear local state regardless of API call success
    localStorage.removeItem('authToken');
    setUser(null);
    setUserProfile(null);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    const response = await apiCall('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (response.success && response.user) {
      setUser(response.user);
      
      // Convert user to UserProfile format
      setUserProfile({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        age: response.user.age,
        gender: response.user.gender,
        phone: response.user.phone,
        medicalHistory: response.user.medicalHistory,
        abhaId: response.user.abhaId,
        language: response.user.language,
        country: response.user.country,
        createdAt: new Date(response.user.createdAt),
        updatedAt: new Date(response.user.updatedAt)
      } as UserProfile);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}