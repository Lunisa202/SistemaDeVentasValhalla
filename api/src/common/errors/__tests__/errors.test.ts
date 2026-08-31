import { describe, it, expect } from 'vitest';
import {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} from '../index';

describe('AppError', () => {
  it('guarda statusCode, code, message y es operacional por defecto', () => {
    const err = new AppError(500, 'CUSTOM', 'Algo pasó');
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('CUSTOM');
    expect(err.message).toBe('Algo pasó');
    expect(err.isOperational).toBe(true);
  });

  it('es una instancia de Error (herencia correcta)', () => {
    const err = new AppError(400, 'X', 'y');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it('acepta details opcionales', () => {
    const details = [{ field: 'email', message: 'inválido' }];
    const err = new AppError(400, 'X', 'y', details);
    expect(err.details).toEqual(details);
  });
});

describe('NotFoundError', () => {
  it('tiene status 404 y código NOT_FOUND', () => {
    const err = new NotFoundError('Producto');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Producto no encontrado');
  });

  it('es sustituible por AppError (Liskov)', () => {
    const err: AppError = new NotFoundError('X');
    expect(err).toBeInstanceOf(AppError);
  });
});

describe('ValidationError', () => {
  it('tiene status 400 y adjunta los details', () => {
    const details = [{ field: 'name', message: 'requerido' }];
    const err = new ValidationError(details);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.details).toEqual(details);
  });
});

describe('UnauthorizedError', () => {
  it('tiene status 401 con mensaje por defecto', () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  it('acepta mensaje custom', () => {
    expect(new UnauthorizedError('Token expirado').message).toBe('Token expirado');
  });
});

describe('ForbiddenError', () => {
  it('tiene status 403', () => {
    expect(new ForbiddenError().statusCode).toBe(403);
    expect(new ForbiddenError().code).toBe('FORBIDDEN');
  });
});

describe('ConflictError', () => {
  it('tiene status 409', () => {
    const err = new ConflictError('El email ya existe');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CONFLICT');
    expect(err.message).toBe('El email ya existe');
  });
});
