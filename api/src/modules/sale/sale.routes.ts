import { Router, type Router as RouterType } from 'express';
import { SaleController } from './sale.controller';
import { asyncHandler } from '../../common/middlewares/async-handler';
import { validateSchema } from '../../common/middlewares/validate-schema';
import { createSaleSchema } from './sale.schema';

export const saleRoutes: RouterType = Router();

/**
 * @swagger
 * /sales:
 *   get:
 *     summary: Listar ventas
 *     description: Retorna lista paginada de ventas con vendedor, cliente, método de pago y detalles. Ordenadas por fecha descendente. Admin y vendedores.
 *     tags: [Ventas]
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
 *         description: Lista de ventas
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
 *                         example: 47
 *                       clientId:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                       sellerId:
 *                         type: string
 *                         format: uuid
 *                       voucherType:
 *                         type: string
 *                         enum: [RECEIPT, INVOICE, TICKET]
 *                       voucherCode:
 *                         type: string
 *                         example: B001-00000047
 *                       saleChannel:
 *                         type: string
 *                         enum: [IN_STORE, ONLINE]
 *                       subtotal:
 *                         type: number
 *                         example: 45.00
 *                       discountAmount:
 *                         type: number
 *                         example: 5.00
 *                       taxBase:
 *                         type: number
 *                         example: 33.90
 *                       taxAmount:
 *                         type: number
 *                         example: 6.10
 *                       total:
 *                         type: number
 *                         example: 40.00
 *                       soldAt:
 *                         type: string
 *                         format: date-time
 *                       seller:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                       client:
 *                         type: object
 *                         nullable: true
 *                       paymentMethod:
 *                         $ref: '#/components/schemas/PaymentMethod'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
saleRoutes.get('/', asyncHandler(SaleController.getAll));

/**
 * @swagger
 * /sales/{id}:
 *   get:
 *     summary: Obtener venta por ID
 *     description: Retorna una venta con todos sus detalles (productos, cantidades, precios, descuentos). Admin y vendedores.
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la venta
 *     responses:
 *       200:
 *         description: Venta encontrada con detalles
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
 *                     voucherCode:
 *                       type: string
 *                     saleChannel:
 *                       type: string
 *                     subtotal:
 *                       type: number
 *                     discountAmount:
 *                       type: number
 *                     taxBase:
 *                       type: number
 *                     taxAmount:
 *                       type: number
 *                     total:
 *                       type: number
 *                     soldAt:
 *                       type: string
 *                       format: date-time
 *                     seller:
 *                       type: object
 *                     client:
 *                       type: object
 *                       nullable: true
 *                     paymentMethod:
 *                       $ref: '#/components/schemas/PaymentMethod'
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
 *                           discountPercent:
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
 *         description: Venta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
saleRoutes.get('/:id', asyncHandler(SaleController.getById));

/**
 * @swagger
 * /sales:
 *   post:
 *     summary: Registrar venta
 *     description: |
 *       Crea una venta con sus detalles en una transacción atómica.
 *       - Decrementa el stock de cada producto.
 *       - Valida stock suficiente (falla si no hay).
 *       - El precio unitario se toma del salePrice actual del producto.
 *       - Soporta descuento por item (porcentaje) y descuento global (monto fijo).
 *       - Calcula IGV 18% (precios incluyen IGV, se descompone en taxBase + taxAmount).
 *       - Si algún producto no tiene stock suficiente, toda la operación se revierte.
 *       Admin y vendedores.
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSale'
 *     responses:
 *       201:
 *         description: Venta registrada exitosamente
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
 *                     sale:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         subtotal:
 *                           type: number
 *                         discountAmount:
 *                           type: number
 *                         taxBase:
 *                           type: number
 *                         taxAmount:
 *                           type: number
 *                         total:
 *                           type: number
 *                         voucherType:
 *                           type: string
 *                         voucherCode:
 *                           type: string
 *                         soldAt:
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
 *                           discountPercent:
 *                             type: number
 *       400:
 *         description: Stock insuficiente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
saleRoutes.post('/', validateSchema(createSaleSchema), asyncHandler(SaleController.create));
