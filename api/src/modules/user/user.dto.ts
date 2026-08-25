import { z } from 'zod';
import { createUserSchema, updateUserSchema } from './user.schema';

/** Input type for creating a user (inferred from Zod schema) */
export type CreateUserDto = z.infer<typeof createUserSchema>;

/** Input type for updating a user (all fields optional) */
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
