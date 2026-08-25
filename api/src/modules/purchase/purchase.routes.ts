import { Router, type Router as RouterType } from 'express';
import { PurchaseController } from './purchase.controller';
import { asyncHandler } from '../../common/middlewares/async-handler';
import { validateSchema } from '../../common/middlewares/validate-schema';
import { createPurchaseSchema } from './purchase.schema';

export const purchaseRoutes: RouterType = Router();

purchaseRoutes.get('/', asyncHandler(PurchaseController.getAll));
purchaseRoutes.get('/:id', asyncHandler(PurchaseController.getById));
purchaseRoutes.post('/', validateSchema(createPurchaseSchema), asyncHandler(PurchaseController.create));
