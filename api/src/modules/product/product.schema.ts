import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  code: z.string().min(3, 'El código debe tener al menos 3 caracteres').max(13),
  salePrice: z.number().positive('El precio debe ser mayor a 0'),
  stock: z.number().int().min(0, 'El stock no puede ser negativo').default(0),
  categoryId: z.number().int().positive(),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  code: z.string().min(3).max(13).optional(),
  salePrice: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});
