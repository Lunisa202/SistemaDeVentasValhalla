import { Router, type Router as RouterType } from 'express';
import { CashRegisterController } from './cash-register.controller';
import { asyncHandler } from '../../common/middlewares/async-handler';
import { validateSchema } from '../../common/middlewares/validate-schema';
import { openCashRegisterSchema, closeCashRegisterSchema } from './cash-register.schema';

export const cashRegisterRoutes: RouterType = Router();

/**
 * @swagger
 * /cash-register/status:
 *   get:
 *     summary: Estado de la caja
 *     description: Indica si hay una caja abierta. El frontend usa esto para mostrar/ocultar la sección de ventas.
 *     tags: [Caja]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado de la caja
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
 *                     isOpen:
 *                       type: boolean
 *                       example: true
 *                     cashRegisterId:
 *                       type: integer
 *                       nullable: true
 *                       example: 3
 */
cashRegisterRoutes.get('/status', asyncHandler(CashRegisterController.getStatus));

/**
 * @swagger
 * /cash-register/current:
 *   get:
 *     summary: Caja abierta actual
 *     description: Retorna la caja actualmente abierta con su información. Null si no hay ninguna abierta.
 *     tags: [Caja]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Caja abierta (o null)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CashRegister'
 */
cashRegisterRoutes.get('/current', asyncHandler(CashRegisterController.getCurrent));

/**
 * @swagger
 * /cash-register:
 *   get:
 *     summary: Historial de cajas
 *     description: Lista paginada de sesiones de caja (abiertas y cerradas), ordenadas por fecha de apertura descendente.
 *     tags: [Caja]
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
 *         description: Historial de cajas
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
 *                     $ref: '#/components/schemas/CashRegister'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
cashRegisterRoutes.get('/', asyncHandler(CashRegisterController.getAll));

/**
 * @swagger
 * /cash-register/{id}:
 *   get:
 *     summary: Obtener caja por ID
 *     description: Retorna una sesión de caja con su resumen por método de pago (si está cerrada).
 *     tags: [Caja]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la caja
 *     responses:
 *       200:
 *         description: Caja encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CashRegister'
 *       404:
 *         description: Caja no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
cashRegisterRoutes.get('/:id', asyncHandler(CashRegisterController.getById));

/**
 * @swagger
 * /cash-register/open:
 *   post:
 *     summary: Abrir caja
 *     description: |
 *       Abre una nueva sesión de caja con un monto de apertura (base/fondo).
 *       Falla si ya existe una caja abierta (solo una sesión a la vez).
 *       Admin y vendedores.
 *     tags: [Caja]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OpenCashRegister'
 *     responses:
 *       201:
 *         description: Caja abierta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CashRegister'
 *       409:
 *         description: Ya existe una caja abierta
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
cashRegisterRoutes.post(
  '/open',
  validateSchema(openCashRegisterSchema),
  asyncHandler(CashRegisterController.open),
);

/**
 * @swagger
 * /cash-register/close:
 *   post:
 *     summary: Cerrar caja
 *     description: |
 *       Cierra la caja abierta.
 *       - Agrupa las ventas de la sesión por método de pago (resumen).
 *       - Calcula el monto esperado (apertura + ventas en efectivo).
 *       - Recibe el monto real contado y calcula la diferencia (sobrante/faltante).
 *       Admin y vendedores.
 *     tags: [Caja]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CloseCashRegister'
 *     responses:
 *       200:
 *         description: Caja cerrada con resumen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CashRegister'
 *       409:
 *         description: No hay ninguna caja abierta para cerrar
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
cashRegisterRoutes.post(
  '/close',
  validateSchema(closeCashRegisterSchema),
  asyncHandler(CashRegisterController.close),
);
