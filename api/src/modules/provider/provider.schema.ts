import { z } from 'zod';

export const createProviderSchema = z.object({
  firstName: z.string().min(2).max(45),
  lastName: z.string().min(2).max(45),
  identityDocument: z.string().min(8).max(20),
  email: z.string().email('Email inválido').max(100),
  phone: z.string().min(7).max(15),
  documentTypeId: z.number().int().positive(),
  companyId: z.string().uuid('ID de empresa inválido'),
});

export const updateProviderSchema = z.object({
  firstName: z.string().min(2).max(45).optional(),
  lastName: z.string().min(2).max(45).optional(),
  identityDocument: z.string().min(8).max(20).optional(),
  email: z.string().email().max(100).optional(),
  phone: z.string().min(7).max(15).optional(),
  documentTypeId: z.number().int().positive().optional(),
  companyId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});
