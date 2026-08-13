import { z } from 'zod';

export const createPurchaseSchema = z.object({
  providerId: z.string().uuid('ID de proveedor inválido'),
  voucherType: z.enum(['RECEIPT', 'INVOICE', 'TICKET']),
  products: z.array(z.object({
    productId: z.string().uuid('ID de producto inválido'),
    quantity: z.number().int().positive('La cantidad debe ser mayor a 0'),
    unitPrice: z.number().positive('El precio debe ser mayor a 0'),
  })).min(1, 'Debe incluir al menos un producto'),
});
