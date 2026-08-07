import { AppError } from './app-error.js';

/**
 * 401 Unauthorized error.
 * Thrown when authentication is required but missing/invalid.
 *
 * Usage:
 *   throw new UnauthorizedError();
 *   throw new UnauthorizedError('Token expirado');
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(401, 'UNAUTHORIZED', message);
  }
}
