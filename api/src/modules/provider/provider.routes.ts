import { Router, type Router as RouterType } from 'express';
import { ProviderController } from './provider.controller';
import { asyncHandler } from '../../common/middlewares/async-handler';
import { validateSchema } from '../../common/middlewares/validate-schema';
import { createProviderSchema, updateProviderSchema } from './provider.schema';

export const providerRoutes: RouterType = Router();

providerRoutes.get('/', asyncHandler(ProviderController.getAll));
providerRoutes.get('/:id', asyncHandler(ProviderController.getById));
providerRoutes.post('/', validateSchema(createProviderSchema), asyncHandler(ProviderController.create));
providerRoutes.patch('/:id', validateSchema(updateProviderSchema), asyncHandler(ProviderController.update));
providerRoutes.delete('/:id', asyncHandler(ProviderController.delete));
