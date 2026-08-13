import { z } from 'zod';

export const createClientSchema = z.object({
  firstName: z.string().min(2).max(45),
  lastName: z.string().min(2).max(45),
  phone: z.string().max(15).optional(),
  email: z.string().email().max(100).optional(),
  documentTypeId: z.number().int().positive(),
  identityDocument: z.string().min(8).max(20),
});

export const updateClientSchema = z.object({
  firstName: z.string().min(2).max(45).optional(),
  lastName: z.string().min(2).max(45).optional(),
  phone: z.string().max(15).nullable().optional(),
  email: z.string().email().max(100).nullable().optional(),
  documentTypeId: z.number().int().positive().optional(),
  identityDocument: z.string().min(8).max(20).optional(),
  isActive: z.boolean().optional(),
});
