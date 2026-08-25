import { z } from 'zod';
import { createProductSchema, updateProductSchema } from './product.schema';

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
