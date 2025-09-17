import express from 'express';
import { verifyIdToken, getUserProfile, saveUserProfile } from '../services/firebase-admin';
import { insertUserProfileSchema } from '@shared/schema';
import { z } from 'zod';

const router = express.Router();

// Firebase auth verification endpoint
router.post('/verify', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token is required'
      });
    }

    const decodedToken = await verifyIdToken(idToken);
    
    // Try to get user profile from Firestore
    let userProfile;
    try {
      userProfile = await getUserProfile(decodedToken.uid);
    } catch (error) {
      // User profile doesn't exist yet, that's okay
      userProfile = null;
    }

    res.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || (userProfile as any)?.name,
        profile: userProfile
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decodedToken = await verifyIdToken(token);
    const userProfile = await getUserProfile(decodedToken.uid);

    res.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || (userProfile as any)?.name,
        profile: userProfile
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
});

// Create or update user profile
router.post('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decodedToken = await verifyIdToken(token);
    
    // Validate profile data
    const profileData = {
      email: decodedToken.email,
      ...req.body
    };

    const validatedProfileData = insertUserProfileSchema.parse(profileData);
    
    const userProfile = await saveUserProfile(decodedToken.uid, validatedProfileData);

    res.json({
      success: true,
      profile: userProfile
    });
  } catch (error) {
    console.error('Profile save error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save profile'
    });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decodedToken = await verifyIdToken(token);
    const userProfile = await saveUserProfile(decodedToken.uid, req.body);

    res.json({
      success: true,
      profile: userProfile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

export { router as authRoutes };