import { Router, type Router as RouterType } from 'express';
import { AuthController } from './auth.controller';
import { asyncHandler } from '../../common/middlewares/async-handler';
import { validateSchema } from '../../common/middlewares/validate-schema';
import { authRateLimiter } from '../../common/middlewares/rate-limiter';
import { loginSchema } from './auth.schema';

/**
 * Auth routes — authentication endpoints.
 *
 * - POST /login: stricter rate limit (5 attempts per 15 min)
 * - POST /refresh: no auth header needed (cookie-based)
 * - POST /logout: no auth header needed (cookie-based)
 */
export const authRoutes: RouterType = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Verifica credenciales y retorna un access token JWT. El refresh token se establece como cookie httpOnly.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LoginResponse'
 *         headers:
 *           Set-Cookie:
 *             description: Refresh token en cookie httpOnly
 *             schema:
 *               type: string
 *               example: refreshToken=abc123; Path=/api/v1/auth; HttpOnly; Secure; SameSite=Strict
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       429:
 *         description: Demasiados intentos (rate limit)
 */
authRoutes.post(
  '/login',
  authRateLimiter,
  validateSchema(loginSchema),
  asyncHandler(AuthController.login),
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refrescar access token
 *     description: Genera un nuevo access token usando el refresh token almacenado en la cookie httpOnly. No requiere header Authorization.
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: Nuevo access token generado
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
 *                     accessToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIs...
 *       401:
 *         description: Refresh token no proporcionado, expirado o revocado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRoutes.post('/refresh', asyncHandler(AuthController.refresh));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Revoca el refresh token en la base de datos y limpia la cookie. No requiere header Authorization.
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
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
 *                     message:
 *                       type: string
 *                       example: Sesión cerrada correctamente
 */
authRoutes.post('/logout', asyncHandler(AuthController.logout));
