import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess } from '../../common/helpers/response';
import { environment } from '../../config/environment';

/**
 * AuthController — HTTP handlers for authentication.
 *
 * Handles:
 * - POST /auth/login → verify credentials, return access token, set refresh cookie
 * - POST /auth/refresh → read refresh cookie, return new access token
 * - POST /auth/logout → revoke refresh token, clear cookie
 *
 * The refresh token is stored in an httpOnly cookie (not accessible from JS).
 * The access token is returned in the response body (stored in memory by frontend).
 */
const service = new AuthService();

// Cookie configuration for refresh token
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: environment.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await service.login(email, password);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

    // Return access token + user info in body
    sendSuccess(res, {
      accessToken: result.accessToken,
      user: result.user,
    });
  }

  static async refresh(req: Request, res: Response) {
    const token = req.cookies?.refreshToken;

    if (!token) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Refresh token no proporcionado' },
      });
      return;
    }

    const result = await service.refresh(token);
    sendSuccess(res, { accessToken: result.accessToken });
  }

  static async logout(req: Request, res: Response) {
    const token = req.cookies?.refreshToken;

    if (token) {
      await service.logout(token);
    }

    // Clear cookie
    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    sendSuccess(res, { message: 'Sesión cerrada correctamente' });
  }
}
