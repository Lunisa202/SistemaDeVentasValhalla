import { Router, type Router as RouterType } from 'express';
import { PurchaseController } from './purchase.controller';
import { asyncHandler } from '../../common/middlewares/async-handler';
import { validateSchema } from '../../common/middlewares/validate-schema';
import { createPurchaseSchema } from './purchase.schema';

export const purchaseRoutes: RouterType = Router();

/**
 * @swagger
 * /purchases:
 *   get:
 *     summary: Listar compras
 *     description: Retorna lista paginada de compras con proveedor, usuario y detalles. Ordenadas por fecha descendente. Solo administradores.
 *     tags: [Compras]
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
 *     responses:
 *       200:
 *         description: Lista de compras
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 5
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       providerId:
 *                         type: string
 *                         format: uuid
 *                       voucherType:
 *                         type: string
 *                         enum: [RECEIPT, INVOICE, TICKET]
 *                       total:
 *                         type: number
 *                         example: 250.00
 *                       purchasedAt:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                       provider:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
purchaseRoutes.get('/', asyncHandler(PurchaseController.getAll));

/**
 * @swagger
 * /purchases/{id}:
 *   get:
 *     summary: Obtener compra por ID
 *     description: Retorna una compra con todos sus detalles (productos, cantidades, precios). Solo administradores.
 *     tags: [Compras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la compra
 *     responses:
 *       200:
 *         description: Compra encontrada con detalles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     voucherType:
 *                       type: string
 *                     total:
 *                       type: number
 *                     purchasedAt:
 *                       type: string
 *                       format: date-time
 *                     user:
 *                       type: object
 *                     provider:
 *                       type: object
 *                     details:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           productId:
 *                             type: string
 *                             format: uuid
 *                           quantity:
 *                             type: integer
 *                           unitPrice:
 *                             type: number
 *                           subtotal:
 *                             type: number
 *                           product:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               code:
 *                                 type: string
 *       404:
 *         description: Compra no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
purchaseRoutes.get('/:id', asyncHandler(PurchaseController.getById));

/**
 * @swagger
 * /purchases:
 *   post:
 *     summary: Registrar compra
 *     description: |
 *       Crea una compra con sus detalles en una transacción atómica.
 *       - Incrementa el stock de cada producto automáticamente.
 *       - El total se calcula como la suma de (quantity × unitPrice) de cada producto.
 *       - Si algún producto no existe, toda la operación se revierte.
 *       Solo administradores.
 *     tags: [Compras]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePurchase'
 *     responses:
 *       201:
 *         description: Compra registrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     purchase:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         total:
 *                           type: number
 *                         voucherType:
 *                           type: string
 *                         purchasedAt:
 *                           type: string
 *                           format: date-time
 *                     details:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           productId:
 *                             type: string
 *                           quantity:
 *                             type: integer
 *                           unitPrice:
 *                             type: number
 *       404:
 *         description: Producto no encontrado
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
purchaseRoutes.post('/', validateSchema(createPurchaseSchema), asyncHandler(PurchaseController.create));
