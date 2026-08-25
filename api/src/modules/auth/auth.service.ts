import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../user/user.model';
import { Role } from '../catalog/models/role.model';
import { RefreshToken } from './refresh-token.model';
import { environment } from '../../config/environment';
import { UnauthorizedError } from '../../common/errors/unauthorized.error';
import { Op } from 'sequelize';

/**
 * AuthService — handles authentication logic.
 *
 * Responsibilities:
 * - Verify credentials (email + password)
 * - Generate access token (short-lived JWT)
 * - Generate and store refresh token (long-lived, in httpOnly cookie)
 * - Refresh access token using valid refresh token
 * - Revoke refresh token on logout
 *
 * Pattern: Service Layer — no HTTP knowledge, pure business logic.
 */
export class AuthService {
  /**
   * Login: verify credentials and return tokens.
   */
  async login(email: string, password: string) {
    // Find user with role included
    const user = await User.findOne({
      where: { email, isActive: true },
      include: [{ model: Role, as: 'role' }],
    });

    if (!user) {
      throw new UnauthorizedError('Email o contraseña incorrectos');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Email o contraseña incorrectos');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role.name,
        roleDisplayName: user.role.displayName,
      },
    };
  }

  /**
   * Refresh: generate new access token from valid refresh token.
   */
  async refresh(token: string) {
    // Find the refresh token in DB
    const storedToken = await RefreshToken.findOne({
      where: {
        token,
        revokedAt: null,
        expiresAt: { [Op.gt]: new Date() },
      },
      include: [{ model: User, include: [{ model: Role, as: 'role' }] }],
    });

    if (!storedToken) {
      throw new UnauthorizedError('Refresh token inválido o expirado');
    }

    const user = storedToken.user;
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Usuario no encontrado o desactivado');
    }

    // Generate new access token
    const accessToken = this.generateAccessToken(user);

    return { accessToken };
  }

  /**
   * Logout: revoke the refresh token.
   */
  async logout(token: string) {
    const storedToken = await RefreshToken.findOne({
      where: { token, revokedAt: null },
    });

    if (storedToken) {
      await storedToken.update({ revokedAt: new Date() });
    }
  }

  /**
   * Generate a short-lived access token (JWT).
   */
  private generateAccessToken(user: User): string {
    const payload = {
      id: user.id,
      role: user.role.name,
      email: user.email,
    };

    return jwt.sign(payload, environment.JWT_ACCESS_SECRET, {
      expiresIn: environment.JWT_ACCESS_EXPIRATION,
    } as jwt.SignOptions);
  }

  /**
   * Generate a long-lived refresh token and store in DB.
   */
  private async generateRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');

    // Parse expiration (e.g., '7d' → 7 days from now)
    const expiresAt = this.parseExpiration(environment.JWT_REFRESH_EXPIRATION);

    await RefreshToken.create({
      userId,
      token,
      expiresAt,
    });

    return token;
  }

  /**
   * Parse duration string (e.g., '7d', '24h') to a Date.
   */
  private parseExpiration(duration: string): Date {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1), 10);
    const now = new Date();

    switch (unit) {
      case 'd': now.setDate(now.getDate() + value); break;
      case 'h': now.setHours(now.getHours() + value); break;
      case 'm': now.setMinutes(now.getMinutes() + value); break;
      default: now.setDate(now.getDate() + 7); // fallback 7 days
    }

    return now;
  }
}
