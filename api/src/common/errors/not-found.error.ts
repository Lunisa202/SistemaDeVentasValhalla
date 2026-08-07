import { AppError } from './app-error.js';

/**
 * 404 Not Found error.
 * Thrown when a requested resource doesn't exist.
 *
 * Usage:
 *   throw new NotFoundError('Producto');
 *   // → { code: "NOT_FOUND", message: "Producto no encontrado" }
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(404, 'NOT_FOUND', `${resource} no encontrado`);
  }
}
