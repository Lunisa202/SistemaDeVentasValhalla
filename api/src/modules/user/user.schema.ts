import { z } from 'zod';

export const createUserSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(45),
  lastName: z.string().min(2, 'Los apellidos deben tener al menos 2 caracteres').max(45),
  identityDocument: z.string().min(8, 'Documento inválido').max(20),
  phone: z.string().max(15).optional(),
  email: z.string().email('Email inválido').max(100),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100),
  roleId: z.number().int().positive(),
  documentTypeId: z.number().int().positive(),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(2).max(45).optional(),
  lastName: z.string().min(2).max(45).optional(),
  identityDocument: z.string().min(8).max(20).optional(),
  phone: z.string().max(15).nullable().optional(),
  email: z.string().email().max(100).optional(),
  password: z.string().min(6).max(100).optional(),
  roleId: z.number().int().positive().optional(),
  documentTypeId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});
