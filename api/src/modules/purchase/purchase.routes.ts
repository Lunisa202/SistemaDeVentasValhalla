import { Router, type Router as RouterType } from 'express';
import { PurchaseController } from './purchase.controller.js';
import { asyncHandler } from '../../common/middlewares/async-handler.js';
import { validateSchema } from '../../common/middlewares/validate-schema.js';
import { createPurchaseSchema } from './purchase.schema.js';

export const purchaseRoutes: RouterType = Router();

purchaseRoutes.get('/', asyncHandler(PurchaseController.getAll));
purchaseRoutes.get('/:id', asyncHandler(PurchaseController.getById));
purchaseRoutes.post('/', validateSchema(createPurchaseSchema), asyncHandler(PurchaseController.create));
