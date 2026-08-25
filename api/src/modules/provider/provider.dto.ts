import { z } from 'zod';
import { createProviderSchema, updateProviderSchema } from './provider.schema';

export type CreateProviderDto = z.infer<typeof createProviderSchema>;
export type UpdateProviderDto = z.infer<typeof updateProviderSchema>;
