import { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, InsertUserProfile } from '@shared/schema';
import { useLocation } from 'wouter';

interface AuthUser {
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
  user: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, profileData: Omit<InsertUserProfile, 'email'>) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth API helper functions
const authApi = {
  async login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  async register(email: string, password: string, profileData: any) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, ...profileData })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  },

  async getMe(token: string) {
    const response = await fetch('/api/auth/me', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  },

  async updateProfile(token: string, data: any) {
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    return response.json();
  },

  async logout(token: string) {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn('Logout request failed, but clearing local state anyway');
    }

    return response.ok;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      
      if (storedToken) {
        try {
          const response = await authApi.getMe(storedToken);
          if (response.success) {
            setUser(response.user);
            setUserProfile(response.user);
            setToken(storedToken);
          } else {
            // Invalid token, clear it
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('Failed to validate stored token:', error);
          localStorage.removeItem('auth_token');
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      
      if (response.success) {
        setUser(response.user);
        setUserProfile(response.user);
        setToken(response.token);
        
        // Store token in localStorage
        localStorage.setItem('auth_token', response.token);
        
        // Redirect to dashboard
        setLocation('/dashboard');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string, profileData: Omit<InsertUserProfile, 'email'>) => {
    try {
      const response = await authApi.register(email, password, profileData);
      
      if (response.success) {
        setUser(response.user);
        setUserProfile(response.user);
        setToken(response.token);
        
        // Store token in localStorage
        localStorage.setItem('auth_token', response.token);
        
        // Redirect to dashboard
        setLocation('/dashboard');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authApi.logout(token);
      }
      
      // Clear local state and localStorage
      setUser(null);
      setUserProfile(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      
      // Redirect to home
      setLocation('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setUserProfile(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      setLocation('/');
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user || !token) throw new Error('No user logged in');

    try {
      const response = await authApi.updateProfile(token, data);
      
      if (response.success) {
        setUser(response.user);
        setUserProfile(response.user);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  // Provide getAuthHeaders utility for API calls
  const getAuthHeaders = () => {
    if (!token) return {};
    return { 'Authorization': `Bearer ${token}` };
  };

  const value = {
    user,
    userProfile,
    loading,
    token,
    login,
    register,
    logout,
    updateUserProfile,
    getAuthHeaders
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Export the getAuthHeaders function for use in API calls
export function useAuthHeaders() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthHeaders must be used within AuthProvider');
  return context.getAuthHeaders?.() || {};
}