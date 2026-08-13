import { z } from 'zod';

/**
 * Zod schemas for auth module validation.
 *
 * Principle: Interface Segregation — login only requires
 * email and password, nothing else.
 */
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});
