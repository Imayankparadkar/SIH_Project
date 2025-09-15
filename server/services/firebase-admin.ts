import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
export const adminStorage = getStorage();

// Helper functions for common operations
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Invalid token');
  }
}

export async function getUserProfile(userId: string) {
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('User profile not found');
    }
    return { id: userId, ...userDoc.data() };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export async function saveUserProfile(userId: string, profileData: any) {
  try {
    await adminDb.collection('users').doc(userId).set(profileData, { merge: true });
    return { id: userId, ...profileData };
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
}

export async function saveVitalSigns(vitalSigns: any) {
  try {
    const docRef = await adminDb.collection('vitals').add({
      ...vitalSigns,
      timestamp: new Date()
    });
    return { id: docRef.id, ...vitalSigns };
  } catch (error) {
    console.error('Error saving vital signs:', error);
    throw error;
  }
}

export async function getVitalSigns(userId: string, limit: number = 50) {
  try {
    const snapshot = await adminDb
      .collection('vitals')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    const vitals: any[] = [];
    snapshot.forEach(doc => {
      vitals.push({ id: doc.id, ...doc.data() });
    });

    return vitals;
  } catch (error) {
    console.error('Error fetching vital signs:', error);
    throw error;
  }
}

export async function saveHealthAnalysis(analysis: any) {
  try {
    const docRef = await adminDb.collection('analyses').add({
      ...analysis,
      timestamp: new Date()
    });
    return { id: docRef.id, ...analysis };
  } catch (error) {
    console.error('Error saving health analysis:', error);
    throw error;
  }
}

export async function saveEmergencyAlert(alert: any) {
  try {
    const docRef = await adminDb.collection('emergencies').add({
      ...alert,
      timestamp: new Date()
    });
    return { id: docRef.id, ...alert };
  } catch (error) {
    console.error('Error saving emergency alert:', error);
    throw error;
  }
}

export async function saveDonation(donation: any) {
  try {
    const docRef = await adminDb.collection('donations').add({
      ...donation,
      createdAt: new Date()
    });
    return { id: docRef.id, ...donation };
  } catch (error) {
    console.error('Error saving donation:', error);
    throw error;
  }
}

export async function getDonations(userId: string) {
  try {
    const snapshot = await adminDb
      .collection('donations')
      .where('donorId', '==', userId)
      .orderBy('scheduledDate', 'desc')
      .get();

    const donations: any[] = [];
    snapshot.forEach(doc => {
      donations.push({ id: doc.id, ...doc.data() });
    });

    return donations;
  } catch (error) {
    console.error('Error fetching donations:', error);
    throw error;
  }
}
