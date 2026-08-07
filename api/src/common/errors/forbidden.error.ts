import { AppError } from './app-error.js';

/**
 * 403 Forbidden error.
 * Thrown when user is authenticated but lacks permission.
 *
 * Usage:
 *   throw new ForbiddenError();
 *   throw new ForbiddenError('No tienes permisos para esta acción');
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado') {
    super(403, 'FORBIDDEN', message);
  }
}
