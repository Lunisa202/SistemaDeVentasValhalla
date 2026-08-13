import { z } from 'zod';

/**
 * Zod schemas for catalog module validation.
 *
 * Only product categories are writable (create/update).
 * Roles, document types, and payment methods are read-only.
 */
export const createCategorySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(60),
  description: z.string().max(150).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(60).optional(),
  description: z.string().max(150).nullable().optional(),
});
