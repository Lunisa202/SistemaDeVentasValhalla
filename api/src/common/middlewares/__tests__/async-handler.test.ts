import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../async-handler';

describe('asyncHandler', () => {
  it('ejecuta el handler y NO llama next en caso de éxito', async () => {
    const handler = vi.fn(async (_req: Request, res: Response) => {
      res.status(200);
    });
    const next = vi.fn();

    const wrapped = asyncHandler(handler);
    await wrapped({} as Request, { status: vi.fn() } as unknown as Response, next);

    expect(handler).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('captura errores async y los pasa a next', async () => {
    const boom = new Error('boom');
    const handler = async () => {
      throw boom;
    };
    const next = vi.fn();

    const wrapped = asyncHandler(handler);
    await wrapped({} as Request, {} as Response, next as NextFunction);

    // Esperar a que la promesa rechazada se procese
    await new Promise((r) => setImmediate(r));

    expect(next).toHaveBeenCalledWith(boom);
  });
});
