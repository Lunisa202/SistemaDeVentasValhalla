/**
 * Round a number to 2 decimal places safely.
 * Avoids JavaScript floating point issues (0.1 + 0.2 = 0.30000000000000004).
 *
 * Uses Math.round with factor multiplication — the standard approach
 * for monetary calculations without external libraries.
 *
 * @param value - Number to round
 * @returns Number rounded to 2 decimal places
 */
export function roundTo2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
