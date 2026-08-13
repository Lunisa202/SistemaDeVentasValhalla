import { z } from 'zod';

export const createSaleSchema = z.object({
  clientId: z.string().uuid().nullable().optional(),
  voucherType: z.enum(['RECEIPT', 'INVOICE', 'TICKET']),
  voucherCode: z.string().min(1).max(30),
  saleChannel: z.enum(['IN_STORE', 'ONLINE']),
  paymentMethodId: z.number().int().positive(),
  products: z.array(z.object({
    productId: z.string().uuid('ID de producto inválido'),
    quantity: z.number().int().positive('La cantidad debe ser mayor a 0'),
  })).min(1, 'Debe incluir al menos un producto'),
});
