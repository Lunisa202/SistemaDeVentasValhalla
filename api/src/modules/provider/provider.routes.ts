import { Router, type Router as RouterType } from 'express';
import { ProviderController } from './provider.controller';
import { asyncHandler } from '../../common/middlewares/async-handler';
import { validateSchema } from '../../common/middlewares/validate-schema';
import { createProviderSchema, updateProviderSchema } from './provider.schema';

export const providerRoutes: RouterType = Router();

/**
 * @swagger
 * /providers:
 *   get:
 *     summary: Listar proveedores
 *     description: Retorna lista paginada de proveedores activos con su empresa y tipo de documento. Solo administradores.
 *     tags: [Proveedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre o email
 *     responses:
 *       200:
 *         description: Lista de proveedores
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
 *                     $ref: '#/components/schemas/Provider'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
providerRoutes.get('/', asyncHandler(ProviderController.getAll));

/**
 * @swagger
 * /providers/{id}:
 *   get:
 *     summary: Obtener proveedor por ID
 *     tags: [Proveedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Proveedor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Provider'
 *       404:
 *         description: Proveedor no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
providerRoutes.get('/:id', asyncHandler(ProviderController.getById));

/**
 * @swagger
 * /providers:
 *   post:
 *     summary: Crear proveedor
 *     description: Registra un nuevo proveedor asociado a una empresa. Solo administradores.
 *     tags: [Proveedores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProvider'
 *     responses:
 *       201:
 *         description: Proveedor creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Provider'
 *       422:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
providerRoutes.post(
  '/',
  validateSchema(createProviderSchema),
  asyncHandler(ProviderController.create),
);

/**
 * @swagger
 * /providers/{id}:
 *   patch:
 *     summary: Actualizar proveedor
 *     description: Actualización parcial de un proveedor. Solo administradores.
 *     tags: [Proveedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProvider'
 *     responses:
 *       200:
 *         description: Proveedor actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Provider'
 *       404:
 *         description: Proveedor no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
providerRoutes.patch(
  '/:id',
  validateSchema(updateProviderSchema),
  asyncHandler(ProviderController.update),
);

/**
 * @swagger
 * /providers/{id}:
 *   delete:
 *     summary: Desactivar proveedor (soft delete)
 *     description: Establece is_active = false. Solo administradores.
 *     tags: [Proveedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Proveedor desactivado
 *       404:
 *         description: Proveedor no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
providerRoutes.delete('/:id', asyncHandler(ProviderController.delete));
