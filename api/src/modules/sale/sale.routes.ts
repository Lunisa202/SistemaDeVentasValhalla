import { Router, type Router as RouterType } from 'express';
import { SaleController } from './sale.controller.js';
import { asyncHandler } from '../../common/middlewares/async-handler.js';
import { validateSchema } from '../../common/middlewares/validate-schema.js';
import { createSaleSchema } from './sale.schema.js';

export const saleRoutes: RouterType = Router();

saleRoutes.get('/', asyncHandler(SaleController.getAll));
saleRoutes.get('/:id', asyncHandler(SaleController.getById));
saleRoutes.post('/', validateSchema(createSaleSchema), asyncHandler(SaleController.create));
