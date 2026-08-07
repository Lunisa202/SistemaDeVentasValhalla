import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { environment } from '../../config/environment.js';
import { UnauthorizedError } from '../errors/unauthorized.error.js';
import { ForbiddenError } from '../errors/forbidden.error.js';

/**
 * JWT payload structure after decoding.
 */
export interface JwtPayload {
  id: string;         // User UUID
  role: string;       // 'admin' | 'seller'
  email: string;
}

/**
 * Extends Express Request to include authenticated user data.
 * After authGuard runs, req.user is guaranteed to exist.
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Authentication & authorization middleware factory.
 *
 * Pattern: Strategy — different roles require different access levels.
 * The middleware verifies the JWT and checks if the user's role
 * is in the allowed roles list.
 *
 * Usage in routes:
 *   routes.use('/users', authGuard(['admin']), userRoutes);
 *   routes.use('/sales', authGuard(['admin', 'seller']), salesRoutes);
 *
 * Flow:
 * 1. Extract token from Authorization header (Bearer <token>)
 * 2. Verify token signature and expiration
 * 3. Check if user's role is allowed for this route
 * 4. Attach user data to req.user for downstream handlers
 *
 * @param allowedRoles - Array of roles that can access this route.
 *                       Empty array = any authenticated user can access.
 */
export function authGuard(allowedRoles: string[] = []) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // 1. Extract token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Token no proporcionado');
    }

    try {
      // 2. Verify token
      const decoded = jwt.verify(token, environment.JWT_ACCESS_SECRET) as JwtPayload;

      // 3. Check roles (if specified)
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        throw new ForbiddenError('No tienes permisos para acceder a este recurso');
      }

      // 4. Attach user to request
      req.user = decoded;
      next();
    } catch (error) {
      // jwt.verify throws specific errors we can translate
      if (error instanceof ForbiddenError) {
        throw error;
      }

      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expirado');
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Token inválido');
      }

      throw new UnauthorizedError('Error de autenticación');
    }
  };
}
