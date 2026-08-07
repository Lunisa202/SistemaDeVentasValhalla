import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error.js';
import { logger } from '../logger.js';

/**
 * Global error handler middleware.
 *
 * This MUST be the last middleware registered in app.ts.
 * Express identifies error handlers by having 4 params (err, req, res, next).
 *
 * How it works:
 * 1. If the error is an AppError (isOperational=true), it's an expected error
 *    (bad input, not found, unauthorized) → return the error details to the client.
 * 2. If it's an unexpected error (bug, DB crash), log it and return a generic message.
 *    Never expose internal error details in production.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Handle operational errors (expected)
  if (err instanceof AppError) {
    const response: Record<string, unknown> = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };

    if (err.details) {
      (response.error as Record<string, unknown>).details = err.details;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle unexpected errors (bugs)
  logger.error({ err }, 'Unhandled error');

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Error interno del servidor',
    },
  });
}
