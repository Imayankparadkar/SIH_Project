import { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, InsertUserProfile } from '@shared/schema';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useLocation } from 'wouter';

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
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, profileData: Omit<InsertUserProfile, 'email'>) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to save user profile to Firestore
const saveUserProfileToFirestore = async (userId: string, profileData: any) => {
  try {
    await setDoc(doc(db, 'userProfiles', userId), {
      ...profileData,
      updatedAt: new Date(),
      createdAt: profileData.createdAt || new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving profile to Firestore:', error);
    throw error;
  }
};

// Helper function to get user profile from Firestore
const getUserProfileFromFirestore = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'userProfiles', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting profile from Firestore:', error);
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Load user profile from Firestore
        const profile = await getUserProfileFromFirestore(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // User state will be updated via onAuthStateChanged
      // Redirect to dashboard after successful login
      setLocation('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string, profileData: Omit<InsertUserProfile, 'email'>) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Save user profile to Firestore
      const userProfile: UserProfile = {
        id: firebaseUser.uid,
        email: email,
        ...profileData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as UserProfile;
      
      await saveUserProfileToFirestore(firebaseUser.uid, userProfile);
      
      // User state will be updated via onAuthStateChanged
      // Redirect to dashboard after successful registration
      setLocation('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // User state will be cleared via onAuthStateChanged
      // Redirect to home page after logout
      setLocation('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    try {
      const updatedProfile = {
        ...userProfile,
        ...data,
        updatedAt: new Date()
      };
      
      await saveUserProfileToFirestore(user.uid, updatedProfile);
      setUserProfile(updatedProfile as UserProfile);
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
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

