import { AppError } from './app-error.js';

/**
 * 400 Validation error.
 * Thrown when request data fails Zod schema validation.
 *
 * Usage:
 *   throw new ValidationError([{ field: 'email', message: 'Email inválido' }]);
 */
export class ValidationError extends AppError {
  constructor(details: unknown) {
    super(400, 'VALIDATION_ERROR', 'Los datos proporcionados no son válidos', details);
  }
}
