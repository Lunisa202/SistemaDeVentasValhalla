import { Router, type Router as RouterType } from 'express';
import { UserController } from './user.controller';
import { asyncHandler } from '../../common/middlewares/async-handler';
import { validateSchema } from '../../common/middlewares/validate-schema';
import { createUserSchema, updateUserSchema } from './user.schema';

export const userRoutes: RouterType = Router();

userRoutes.get('/', asyncHandler(UserController.getAll));
userRoutes.get('/:id', asyncHandler(UserController.getById));
userRoutes.post('/', validateSchema(createUserSchema), asyncHandler(UserController.create));
userRoutes.patch('/:id', validateSchema(updateUserSchema), asyncHandler(UserController.update));
userRoutes.delete('/:id', asyncHandler(UserController.delete));
