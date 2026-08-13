import { Router, type Router as RouterType } from 'express';
import { ClientController } from './client.controller.js';
import { asyncHandler } from '../../common/middlewares/async-handler.js';
import { validateSchema } from '../../common/middlewares/validate-schema.js';
import { createClientSchema, updateClientSchema } from './client.schema.js';

export const clientRoutes: RouterType = Router();

clientRoutes.get('/', asyncHandler(ClientController.getAll));
clientRoutes.get('/:id', asyncHandler(ClientController.getById));
clientRoutes.post('/', validateSchema(createClientSchema), asyncHandler(ClientController.create));
clientRoutes.patch('/:id', validateSchema(updateClientSchema), asyncHandler(ClientController.update));
clientRoutes.delete('/:id', asyncHandler(ClientController.delete));
