import { Router, type Router as RouterType } from 'express';
import { ProductController } from './product.controller.js';
import { asyncHandler } from '../../common/middlewares/async-handler.js';
import { validateSchema } from '../../common/middlewares/validate-schema.js';
import { createProductSchema, updateProductSchema } from './product.schema.js';

export const productRoutes: RouterType = Router();

productRoutes.get('/', asyncHandler(ProductController.getAll));
productRoutes.get('/code/:code', asyncHandler(ProductController.getByCode)); // QR/barcode lookup
productRoutes.get('/:id', asyncHandler(ProductController.getById));
productRoutes.post('/', validateSchema(createProductSchema), asyncHandler(ProductController.create));
productRoutes.patch('/:id', validateSchema(updateProductSchema), asyncHandler(ProductController.update));
productRoutes.delete('/:id', asyncHandler(ProductController.delete));
