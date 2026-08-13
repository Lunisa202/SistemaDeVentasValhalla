import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  taxId: z.string().min(8, 'RUC inválido').max(25),
});

export const updateCompanySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  taxId: z.string().min(8).max(25).optional(),
  isActive: z.boolean().optional(),
});
