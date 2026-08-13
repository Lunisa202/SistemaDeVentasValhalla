import { Router, type Router as RouterType } from 'express';
import { ProviderController } from './provider.controller.js';
import { asyncHandler } from '../../common/middlewares/async-handler.js';
import { validateSchema } from '../../common/middlewares/validate-schema.js';
import { createProviderSchema, updateProviderSchema } from './provider.schema.js';

export const providerRoutes: RouterType = Router();

providerRoutes.get('/', asyncHandler(ProviderController.getAll));
providerRoutes.get('/:id', asyncHandler(ProviderController.getById));
providerRoutes.post('/', validateSchema(createProviderSchema), asyncHandler(ProviderController.create));
providerRoutes.patch('/:id', validateSchema(updateProviderSchema), asyncHandler(ProviderController.update));
providerRoutes.delete('/:id', asyncHandler(ProviderController.delete));
