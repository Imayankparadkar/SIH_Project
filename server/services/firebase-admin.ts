// Temporary stub implementation for firebase-admin (firebase-admin package not installed)
// TODO: Install firebase-admin package and implement proper Firebase integration

console.log('Warning: Using stub Firebase Admin implementation. Firebase features are disabled.');

export const adminAuth = null;
export const adminDb = null;
export const adminStorage = null;

// Stub implementations for firebase-admin functions
export async function verifyIdToken(idToken: string) {
  console.log('Stub: verifyIdToken called');
  // Return a mock decoded token for development
  return {
    uid: 'stub-user-id',
    email: 'user@example.com',
    iss: 'stub',
    aud: 'stub',
    auth_time: Date.now() / 1000,
    iat: Date.now() / 1000,
    exp: (Date.now() / 1000) + 3600,
    sub: 'stub-user-id'
  };
}

export async function getUserProfile(userId: string) {
  console.log('Stub: getUserProfile called with userId:', userId);
  return { 
    id: userId, 
    email: 'user@example.com',
    name: 'Test User',
    age: 30,
    gender: 'other' as const
  };
}

export async function saveUserProfile(userId: string, profileData: any) {
  console.log('Stub: saveUserProfile called');
  return { id: userId, ...profileData };
}

export async function saveVitalSigns(vitalSigns: any) {
  console.log('Stub: saveVitalSigns called');
  return { id: 'stub-vital-id', ...vitalSigns };
}

export async function getVitalSigns(userId: string, limit: number = 50) {
  console.log('Stub: getVitalSigns called');
  return [];
}

export async function saveHealthAnalysis(analysis: any) {
  console.log('Stub: saveHealthAnalysis called');
  return { id: 'stub-analysis-id', ...analysis };
}

export async function saveEmergencyAlert(alert: any) {
  console.log('Stub: saveEmergencyAlert called');
  return { id: 'stub-alert-id', ...alert };
}

export async function saveDonation(donation: any) {
  console.log('Stub: saveDonation called');
  return { id: 'stub-donation-id', ...donation };
}

export async function getDonations(userId: string) {
  console.log('Stub: getDonations called');
  return [];
}
