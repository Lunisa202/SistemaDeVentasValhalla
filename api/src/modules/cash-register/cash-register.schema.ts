import { z } from 'zod';

/**
 * Zod schemas for the cash-register module.
 *
 * - openCashRegisterSchema: opening amount (base cash in the drawer).
 * - closeCashRegisterSchema: actual counted cash + optional notes.
 */
export const openCashRegisterSchema = z.object({
  openingAmount: z.number().min(0, 'El monto de apertura no puede ser negativo').default(0),
  notes: z.string().max(500).optional(),
});

export const closeCashRegisterSchema = z.object({
  actualAmount: z.number().min(0, 'El monto contado no puede ser negativo'),
  notes: z.string().max(500).optional(),
});
