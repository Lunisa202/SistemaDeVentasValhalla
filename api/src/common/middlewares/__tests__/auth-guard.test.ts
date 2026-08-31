import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

// Mock the environment module so we don't load DB config / validate real env.
vi.mock('../../../config/environment', () => ({
  environment: {
    JWT_ACCESS_SECRET: 'test-secret-for-auth-guard',
  },
}));

import { authGuard } from '../auth-guard';
import { UnauthorizedError } from '../../errors/unauthorized.error';
import { ForbiddenError } from '../../errors/forbidden.error';

const SECRET = 'test-secret-for-auth-guard';

function makeReq(token?: string): Request {
  return {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  } as Request;
}

function sign(payload: object, expiresIn = '15m') {
  return jwt.sign(payload, SECRET, { expiresIn } as jwt.SignOptions);
}

describe('authGuard', () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
  });

  it('rechaza si no hay header Authorization', () => {
    expect(() => authGuard()(makeReq(), {} as Response, next)).toThrow(UnauthorizedError);
  });

  it('rechaza un token inválido', () => {
    expect(() => authGuard()(makeReq('token-basura'), {} as Response, next)).toThrow(
      UnauthorizedError,
    );
  });

  it('rechaza un token expirado', () => {
    const expired = sign({ id: '1', role: 'admin', email: 'a@a.com' }, '-1s');
    expect(() => authGuard()(makeReq(expired), {} as Response, next)).toThrow('Token expirado');
  });

  it('acepta un token válido y adjunta req.user', () => {
    const token = sign({ id: 'u1', role: 'admin', email: 'admin@valhalla.com' });
    const req = makeReq(token);

    authGuard()(req, {} as Response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toMatchObject({ id: 'u1', role: 'admin' });
  });

  it('permite el acceso si el rol está en la lista permitida', () => {
    const token = sign({ id: 'u1', role: 'seller', email: 's@v.com' });
    authGuard(['admin', 'seller'])(makeReq(token), {} as Response, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('rechaza con ForbiddenError si el rol no está permitido', () => {
    const token = sign({ id: 'u1', role: 'seller', email: 's@v.com' });
    expect(() => authGuard(['admin'])(makeReq(token), {} as Response, next)).toThrow(
      ForbiddenError,
    );
  });
});
