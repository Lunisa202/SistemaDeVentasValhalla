import type { Request, Response, NextFunction } from 'express';

/**
 * Async handler wrapper.
 *
 * Express doesn't catch errors from async route handlers automatically.
 * Without this, you'd need try-catch in every controller method.
 *
 * This wrapper catches any rejected promise and passes the error
 * to the next() function, which triggers the global error handler.
 *
 * Usage:
 *   router.get('/', asyncHandler(ProductController.getAll));
 *
 * Before (repetitive):
 *   async getAll(req, res) {
 *     try { ... } catch(e) { next(e) }  // repeated in EVERY method
 *   }
 *
 * After (clean):
 *   async getAll(req, res) {
 *     const products = await service.getAll();
 *     sendSuccess(res, products);
 *   }
 */
type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function asyncHandler(fn: AsyncRequestHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
