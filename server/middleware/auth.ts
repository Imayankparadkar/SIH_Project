import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/dev-auth';

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

    // Verify the token with development auth
    const user = await verifyToken(idToken);
    
    if (!user) {
      throw new Error('Invalid token');
    }
    
    // Add user info to request object
    req.user = {
      uid: user.id,
      ...user
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
  verifyToken(idToken)
    .then(user => {
      if (user) {
        req.user = {
          uid: user.id,
          ...user
        };
      }
      next();
    })
    .catch(() => {
      next();
    });
}
