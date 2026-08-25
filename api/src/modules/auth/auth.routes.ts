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

authRoutes.post(
  '/login',
  authRateLimiter,
  validateSchema(loginSchema),
  asyncHandler(AuthController.login),
);

authRoutes.post('/refresh', asyncHandler(AuthController.refresh));
authRoutes.post('/logout', asyncHandler(AuthController.logout));
