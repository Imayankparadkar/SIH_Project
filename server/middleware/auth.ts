import { Request, Response, NextFunction } from 'express';
import { verifyIdToken } from '../services/firebase-admin';

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    [key: string]: any;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // In development mode, skip auth and use demo user
    if (process.env.NODE_ENV === 'development') {
      req.user = {
        uid: 'demo-user-1',
        email: 'demo@sehatify.com',
        name: 'Demo User'
      };
      return next();
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authorization header missing or invalid'
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken) {
      return res.status(401).json({
        error: 'ID token missing'
      });
    }

    // Verify the token with Firebase
    const decodedToken = await verifyIdToken(idToken);
    
    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      ...decodedToken
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      error: 'Invalid or expired token'
    });
  }
}

export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const idToken = authHeader.split('Bearer ')[1];
  
  if (!idToken) {
    return next();
  }

  // Try to verify token, but don't fail if invalid
  verifyIdToken(idToken)
    .then(decodedToken => {
      if (decodedToken) {
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          ...decodedToken
        };
      }
      next();
    })
    .catch(() => {
      next();
    });
}
