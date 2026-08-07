import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ValidationError } from '../errors/validation.error.js';

/**
 * Schema validation middleware factory.
 *
 * Creates a middleware that validates req.body against a Zod schema.
 * If valid: replaces req.body with parsed/transformed data and continues.
 * If invalid: throws ValidationError (caught by error handler).
 *
 * Usage in routes:
 *   router.post('/', validateSchema(createProductSchema), ProductController.create);
 *
 * Principle: Interface Segregation — each endpoint defines exactly
 * what fields it accepts via its own schema.
 */
export function validateSchema(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      throw new ValidationError(details);
    }

    // Replace body with parsed data (applies transforms, defaults, etc.)
    req.body = result.data;
    next();
  };
}
