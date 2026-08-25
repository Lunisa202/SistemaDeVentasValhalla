import { z } from 'zod';
import { createClientSchema, updateClientSchema } from './client.schema';

export type CreateClientDto = z.infer<typeof createClientSchema>;
export type UpdateClientDto = z.infer<typeof updateClientSchema>;
