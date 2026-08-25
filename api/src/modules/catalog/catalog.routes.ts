import { Router, type Router as RouterType } from 'express';
import { CatalogController } from './catalog.controller';
import { asyncHandler } from '../../common/middlewares/async-handler';
import { validateSchema } from '../../common/middlewares/validate-schema';
import { createCategorySchema, updateCategorySchema } from './catalog.schema';
import { authGuard } from '../../common/middlewares/auth-guard';

/**
 * Catalog routes — reference data endpoints.
 *
 * GET endpoints are public (no auth required) — the frontend
 * needs this data to render dropdowns before the user logs in.
 *
 * POST/PATCH/DELETE on categories require admin role.
 */
export const catalogRoutes: RouterType = Router();

// Read-only (no auth required)
catalogRoutes.get('/roles', asyncHandler(CatalogController.getRoles));
catalogRoutes.get('/document-types', asyncHandler(CatalogController.getDocumentTypes));
catalogRoutes.get('/payment-methods', asyncHandler(CatalogController.getPaymentMethods));
catalogRoutes.get('/categories', asyncHandler(CatalogController.getProductCategories));

// Writable (admin only)
catalogRoutes.post(
  '/categories',
  authGuard(['admin']),
  validateSchema(createCategorySchema),
  asyncHandler(CatalogController.createProductCategory),
);
catalogRoutes.patch(
  '/categories/:id',
  authGuard(['admin']),
  validateSchema(updateCategorySchema),
  asyncHandler(CatalogController.updateProductCategory),
);
catalogRoutes.delete(
  '/categories/:id',
  authGuard(['admin']),
  asyncHandler(CatalogController.deleteProductCategory),
);
