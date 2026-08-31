import { Router, type Router as RouterType } from 'express';
import { AnalyticsController } from './analytics.controller';
import { asyncHandler } from '../../common/middlewares/async-handler';

export const analyticsRoutes: RouterType = Router();

/**
 * @swagger
 * /analytics/overview:
 *   get:
 *     summary: Resumen general (hoy / semana / mes)
 *     description: Totales de ventas y número de transacciones para hoy, la semana y el mes actuales.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     today: { $ref: '#/components/schemas/AnalyticsWindow' }
 *                     week: { $ref: '#/components/schemas/AnalyticsWindow' }
 *                     month: { $ref: '#/components/schemas/AnalyticsWindow' }
 */
analyticsRoutes.get('/overview', asyncHandler(AnalyticsController.overview));

/**
 * @swagger
 * /analytics/sales-by-period:
 *   get:
 *     summary: Ventas agrupadas por período
 *     description: Serie temporal de ventas agrupada por día, semana o mes dentro de un rango.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *         description: "Fecha inicial (YYYY-MM-DD). Por defecto, hace 30 días."
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *         description: "Fecha final (YYYY-MM-DD). Por defecto, hoy."
 *       - in: query
 *         name: groupBy
 *         schema: { type: string, enum: [day, week, month], default: day }
 *     responses:
 *       200:
 *         description: Serie temporal de ventas
 */
analyticsRoutes.get('/sales-by-period', asyncHandler(AnalyticsController.salesByPeriod));

/**
 * @swagger
 * /analytics/top-products:
 *   get:
 *     summary: Productos más vendidos
 *     description: Top-N productos por unidades vendidas dentro de un rango.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 50 }
 *     responses:
 *       200:
 *         description: Ranking de productos
 */
analyticsRoutes.get('/top-products', asyncHandler(AnalyticsController.topProducts));

/**
 * @swagger
 * /analytics/sales-by-payment-method:
 *   get:
 *     summary: Ventas por método de pago
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Desglose por método de pago
 */
analyticsRoutes.get(
  '/sales-by-payment-method',
  asyncHandler(AnalyticsController.salesByPaymentMethod),
);

/**
 * @swagger
 * /analytics/sales-by-category:
 *   get:
 *     summary: Ventas por categoría de producto
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Desglose por categoría
 */
analyticsRoutes.get('/sales-by-category', asyncHandler(AnalyticsController.salesByCategory));

/**
 * @swagger
 * /analytics/profit-loss:
 *   get:
 *     summary: Ganancias vs compras (flujo de caja)
 *     description: |
 *       Compara ingresos por ventas vs gasto en compras dentro de un rango.
 *       Es una vista de flujo de caja del período (dinero entra vs sale),
 *       NO el margen por producto (que requeriría costo promedio ponderado).
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Balance del período
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     salesTotal: { type: number, example: 1250.00 }
 *                     purchasesTotal: { type: number, example: 800.00 }
 *                     balance: { type: number, example: 450.00 }
 */
analyticsRoutes.get('/profit-loss', asyncHandler(AnalyticsController.profitLoss));

/**
 * @swagger
 * /analytics/low-stock:
 *   get:
 *     summary: Productos con stock bajo
 *     description: Productos activos con stock igual o menor al umbral (default 10).
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema: { type: integer, default: 10 }
 *         description: Umbral de stock
 *     responses:
 *       200:
 *         description: Lista de productos con stock bajo
 */
analyticsRoutes.get('/low-stock', asyncHandler(AnalyticsController.lowStock));

/**
 * @swagger
 * /analytics/sales-by-seller:
 *   get:
 *     summary: Rendimiento por vendedor
 *     description: Total vendido y número de transacciones por vendedor dentro de un rango.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Ranking de vendedores
 */
analyticsRoutes.get('/sales-by-seller', asyncHandler(AnalyticsController.salesBySeller));
