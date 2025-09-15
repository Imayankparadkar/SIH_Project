import express from 'express';
import { register, login, logout, verifyToken, getUserById, updateUserProfile, initializeDemoUsers } from '../services/dev-auth';
import { insertUserProfileSchema } from '@shared/schema';
import { z } from 'zod';

const router = express.Router();

// Initialize demo users on startup (async)
initializeDemoUsers().catch(console.error);

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, ...profileData } = req.body;

    // Validate input
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6)
    });

    const { email: validatedEmail, password: validatedPassword } = loginSchema.parse({
      email,
      password
    });

    // Validate profile data
    const validatedProfileData = insertUserProfileSchema.parse({
      email: validatedEmail,
      ...profileData
    });

    // Remove email from profile data as it's handled separately
    const { email: _, ...profileDataWithoutEmail } = validatedProfileData;

    const { user, token } = await register(validatedEmail, validatedPassword, profileDataWithoutEmail);

    res.status(201).json({
      success: true,
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Registration failed'
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(1)
    });

    const { email: validatedEmail, password: validatedPassword } = loginSchema.parse({
      email,
      password
    });

    const { user, token } = await login(validatedEmail, validatedPassword);

    res.json({
      success: true,
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Login failed'
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      await logout(token);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
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

    const user = await verifyToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
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

    const currentUser = await verifyToken(token);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    const updatedUser = await updateUserProfile(currentUser.id, req.body);

    res.json({
      success: true,
      user: updatedUser
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