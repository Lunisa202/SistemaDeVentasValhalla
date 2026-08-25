import { Router, type Router as RouterType } from 'express';
import { SaleController } from './sale.controller';
import { asyncHandler } from '../../common/middlewares/async-handler';
import { validateSchema } from '../../common/middlewares/validate-schema';
import { createSaleSchema } from './sale.schema';

export const saleRoutes: RouterType = Router();

saleRoutes.get('/', asyncHandler(SaleController.getAll));
saleRoutes.get('/:id', asyncHandler(SaleController.getById));
saleRoutes.post('/', validateSchema(createSaleSchema), asyncHandler(SaleController.create));
