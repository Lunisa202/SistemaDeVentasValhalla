import { describe, it, expect } from 'vitest';
import { roundTo2 } from '../math';

describe('roundTo2', () => {
  it('redondea a 2 decimales', () => {
    expect(roundTo2(3.14159)).toBe(3.14);
  });

  it('resuelve el error clásico de punto flotante (0.1 + 0.2)', () => {
    expect(roundTo2(0.1 + 0.2)).toBe(0.3);
  });

  it('redondea correctamente hacia arriba en .005', () => {
    expect(roundTo2(2.005)).toBe(2.01);
  });

  it('deja intactos los enteros', () => {
    expect(roundTo2(100)).toBe(100);
  });

  it('maneja el cero', () => {
    expect(roundTo2(0)).toBe(0);
  });

  it('redondea cálculos monetarios típicos (IGV)', () => {
    // total / 1.18 (descomposición de IGV)
    expect(roundTo2(40 / 1.18)).toBe(33.9);
  });
});
