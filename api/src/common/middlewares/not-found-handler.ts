import type { Request, Response } from 'express';

/**
 * Catch-all handler for undefined routes.
 * Registered AFTER all valid routes in app.ts.
 * If a request reaches this point, no route matched → 404.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Ruta ${req.method} ${req.originalUrl} no encontrada`,
    },
  });
}
