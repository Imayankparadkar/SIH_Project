import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

let adminApp: App;
let adminAuth: Auth;
let adminDb: Firestore;
let adminStorage: Storage;

// Initialize Firebase Admin with service account credentials
try {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    
    if (!projectId || !privateKey || !clientEmail) {
      console.warn('Firebase credentials not found. Falling back to development mode.');
      throw new Error('Firebase credentials not found');
    }

    adminApp = initializeApp({
      credential: cert({
        projectId: projectId,
        privateKey: privateKey.replace(/\\n/g, '\n'),
        clientEmail: clientEmail,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
    
    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    adminStorage = getStorage(adminApp);

    console.log('Firebase Admin initialized successfully');
  } else {
    adminApp = getApps()[0];
    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    adminStorage = getStorage(adminApp);
  }
} catch (error) {
  console.warn('Warning: Firebase Admin initialization failed. Using stub implementation.', error);
  // Fall back to stub implementation if initialization fails
  adminAuth = null as any;
  adminDb = null as any;
  adminStorage = null as any;
}

export { adminAuth, adminDb, adminStorage };

// Firebase Admin service functions
export async function verifyIdToken(idToken: string) {
  if (!adminAuth) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Invalid ID token');
  }
}

export async function getUserProfile(userId: string) {
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    const doc = await adminDb.collection('users').doc(userId).get();
    if (!doc.exists) {
      throw new Error('User profile not found');
    }
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

export async function saveUserProfile(userId: string, profileData: any) {
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    const profileWithTimestamp = {
      ...profileData,
      updatedAt: new Date(),
      createdAt: profileData.createdAt || new Date()
    };
    
    await adminDb.collection('users').doc(userId).set(profileWithTimestamp, { merge: true });
    return { id: userId, ...profileWithTimestamp };
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
}

export async function saveVitalSigns(vitalSigns: any) {
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    const vitalWithTimestamp = {
      ...vitalSigns,
      timestamp: vitalSigns.timestamp || new Date(),
      createdAt: new Date()
    };
    
    const docRef = await adminDb.collection('vitalSigns').add(vitalWithTimestamp);
    return { id: docRef.id, ...vitalWithTimestamp };
  } catch (error) {
    console.error('Error saving vital signs:', error);
    throw error;
  }
}

export async function getVitalSigns(userId: string, limit: number = 50) {
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    const query = adminDb
      .collection('vitalSigns')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit);
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting vital signs:', error);
    throw error;
  }
}

export async function saveHealthAnalysis(analysis: any) {
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    const analysisWithTimestamp = {
      ...analysis,
      createdAt: new Date()
    };
    
    const docRef = await adminDb.collection('healthAnalyses').add(analysisWithTimestamp);
    return { id: docRef.id, ...analysisWithTimestamp };
  } catch (error) {
    console.error('Error saving health analysis:', error);
    throw error;
  }
}

export async function saveEmergencyAlert(alert: any) {
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    const alertWithTimestamp = {
      ...alert,
      createdAt: new Date(),
      resolved: false
    };
    
    const docRef = await adminDb.collection('emergencyAlerts').add(alertWithTimestamp);
    return { id: docRef.id, ...alertWithTimestamp };
  } catch (error) {
    console.error('Error saving emergency alert:', error);
    throw error;
  }
}

export async function saveDonation(donation: any) {
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    const donationWithTimestamp = {
      ...donation,
      createdAt: new Date(),
      status: 'pending'
    };
    
    const docRef = await adminDb.collection('donations').add(donationWithTimestamp);
    return { id: docRef.id, ...donationWithTimestamp };
  } catch (error) {
    console.error('Error saving donation:', error);
    throw error;
  }
}

export async function getDonations(userId: string) {
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    const query = adminDb
      .collection('donations')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc');
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting donations:', error);
    throw error;
  }
}
