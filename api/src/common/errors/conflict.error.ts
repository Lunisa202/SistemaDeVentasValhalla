import { AppError } from './app-error.js';

/**
 * 409 Conflict error.
 * Thrown when a resource already exists or conflicts with current state.
 *
 * Usage:
 *   throw new ConflictError('El email ya está registrado');
 */
export class ConflictError extends AppError {
  constructor(message = 'El recurso ya existe') {
    super(409, 'CONFLICT', message);
  }
}
