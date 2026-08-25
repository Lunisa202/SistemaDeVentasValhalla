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

/**
 * @swagger
 * /catalog/roles:
 *   get:
 *     summary: Listar roles del sistema
 *     description: Retorna todos los roles disponibles (admin, seller). Endpoint público.
 *     tags: [Catálogos]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de roles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Role'
 */
catalogRoutes.get('/roles', asyncHandler(CatalogController.getRoles));

/**
 * @swagger
 * /catalog/document-types:
 *   get:
 *     summary: Listar tipos de documento
 *     description: Retorna todos los tipos de documento de identidad (DNI, Pasaporte, etc.). Endpoint público.
 *     tags: [Catálogos]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de tipos de documento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DocumentType'
 */
catalogRoutes.get('/document-types', asyncHandler(CatalogController.getDocumentTypes));

/**
 * @swagger
 * /catalog/payment-methods:
 *   get:
 *     summary: Listar métodos de pago
 *     description: Retorna todos los métodos de pago aceptados (Efectivo, Yape, Plin, tarjetas). Endpoint público.
 *     tags: [Catálogos]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de métodos de pago
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PaymentMethod'
 */
catalogRoutes.get('/payment-methods', asyncHandler(CatalogController.getPaymentMethods));

/**
 * @swagger
 * /catalog/categories:
 *   get:
 *     summary: Listar categorías de producto
 *     description: Retorna todas las categorías de producto. Endpoint público.
 *     tags: [Catálogos]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductCategory'
 */
catalogRoutes.get('/categories', asyncHandler(CatalogController.getProductCategories));

/**
 * @swagger
 * /catalog/categories:
 *   post:
 *     summary: Crear categoría de producto
 *     description: Crea una nueva categoría. Solo administradores.
 *     tags: [Catálogos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 60
 *                 example: Lácteos
 *               description:
 *                 type: string
 *                 maxLength: 150
 *                 example: Productos derivados de la leche
 *     responses:
 *       201:
 *         description: Categoría creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ProductCategory'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Sin permisos (no es admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
catalogRoutes.post(
  '/categories',
  authGuard(['admin']),
  validateSchema(createCategorySchema),
  asyncHandler(CatalogController.createProductCategory),
);

/**
 * @swagger
 * /catalog/categories/{id}:
 *   patch:
 *     summary: Actualizar categoría de producto
 *     description: Actualización parcial de una categoría existente. Solo administradores.
 *     tags: [Catálogos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 60
 *               description:
 *                 type: string
 *                 maxLength: 150
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ProductCategory'
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
catalogRoutes.patch(
  '/categories/:id',
  authGuard(['admin']),
  validateSchema(updateCategorySchema),
  asyncHandler(CatalogController.updateProductCategory),
);

/**
 * @swagger
 * /catalog/categories/{id}:
 *   delete:
 *     summary: Eliminar categoría de producto
 *     description: Elimina una categoría. Falla si tiene productos asociados (RESTRICT). Solo administradores.
 *     tags: [Catálogos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *     responses:
 *       204:
 *         description: Categoría eliminada
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: No se puede eliminar (tiene productos asociados)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
catalogRoutes.delete(
  '/categories/:id',
  authGuard(['admin']),
  asyncHandler(CatalogController.deleteProductCategory),
);
