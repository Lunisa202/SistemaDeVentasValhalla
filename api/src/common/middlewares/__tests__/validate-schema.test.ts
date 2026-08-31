import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { validateSchema } from '../validate-schema';
import { ValidationError } from '../../errors/validation.error';

const schema = z.object({
  name: z.string().min(2),
  age: z.number().int().positive().default(18),
});

describe('validateSchema', () => {
  it('llama next y reemplaza req.body con datos parseados en caso válido', () => {
    const req = { body: { name: 'Ana', age: 25 } } as Request;
    const next = vi.fn();

    validateSchema(schema)(req, {} as Response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.body).toEqual({ name: 'Ana', age: 25 });
  });

  it('aplica valores por defecto del schema', () => {
    const req = { body: { name: 'Ana' } } as Request;
    const next = vi.fn();

    validateSchema(schema)(req, {} as Response, next);

    expect(req.body.age).toBe(18);
  });

  it('lanza ValidationError con datos inválidos', () => {
    const req = { body: { name: 'A' } } as Request;
    const next = vi.fn();

    expect(() => validateSchema(schema)(req, {} as Response, next)).toThrow(ValidationError);
    expect(next).not.toHaveBeenCalled();
  });

  it('el ValidationError incluye el campo que falló en details', () => {
    const req = { body: { name: 'A' } } as Request;
    try {
      validateSchema(schema)(req, {} as Response, vi.fn() as NextFunction);
    } catch (e) {
      const err = e as ValidationError;
      const details = err.details as Array<{ field: string; message: string }>;
      expect(details[0].field).toBe('name');
    }
  });
});
