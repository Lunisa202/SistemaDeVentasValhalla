import { describe, it, expect } from 'vitest';
import { parsePaginationParams, getOffset, buildPaginationMeta } from '../pagination';

describe('parsePaginationParams', () => {
  it('usa valores por defecto cuando no se proporcionan', () => {
    expect(parsePaginationParams({})).toEqual({ page: 1, limit: 20 });
  });

  it('parsea page y limit desde strings (query params)', () => {
    expect(parsePaginationParams({ page: '3', limit: '50' })).toEqual({ page: 3, limit: 50 });
  });

  it('limita el máximo de limit a 100', () => {
    expect(parsePaginationParams({ limit: '500' }).limit).toBe(100);
  });

  it('trata limit=0 como no especificado (cae al default 20)', () => {
    // Number('0') || 20 => 20, porque 0 es falsy. Comportamiento deseado:
    // un limit de 0 no tiene sentido, así que se usa el default.
    expect(parsePaginationParams({ limit: '0' }).limit).toBe(20);
  });

  it('fuerza limit mínimo de 1 con valores negativos', () => {
    // Number('-3') || 20 => -3, luego Math.max(1, -3) => 1
    expect(parsePaginationParams({ limit: '-3' }).limit).toBe(1);
  });

  it('fuerza page mínima de 1 con valores negativos', () => {
    expect(parsePaginationParams({ page: '-5' }).page).toBe(1);
  });

  it('cae en defaults con valores no numéricos', () => {
    expect(parsePaginationParams({ page: 'abc', limit: 'xyz' })).toEqual({ page: 1, limit: 20 });
  });
});

describe('getOffset', () => {
  it('calcula offset 0 en la primera página', () => {
    expect(getOffset({ page: 1, limit: 20 })).toBe(0);
  });

  it('calcula offset correcto en páginas posteriores', () => {
    expect(getOffset({ page: 3, limit: 20 })).toBe(40);
  });
});

describe('buildPaginationMeta', () => {
  it('calcula totalPages redondeando hacia arriba', () => {
    const meta = buildPaginationMeta(45, { page: 1, limit: 10 });
    expect(meta).toEqual({ page: 1, limit: 10, total: 45, totalPages: 5 });
  });

  it('devuelve totalPages 0 cuando no hay registros', () => {
    expect(buildPaginationMeta(0, { page: 1, limit: 10 }).totalPages).toBe(0);
  });

  it('devuelve 1 página cuando el total cabe justo', () => {
    expect(buildPaginationMeta(10, { page: 1, limit: 10 }).totalPages).toBe(1);
  });
});
