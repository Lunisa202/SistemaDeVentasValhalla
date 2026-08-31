import { z } from 'zod';

/**
 * Query param schemas for analytics endpoints.
 *
 * All analytics endpoints accept an optional date range (from/to).
 * Some accept a grouping granularity or a limit.
 *
 * Dates are ISO strings (YYYY-MM-DD). If omitted, sensible defaults apply
 * per endpoint (e.g. current month).
 */

/** Reusable date-range query. */
export const dateRangeQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

/** Grouping period for time series. */
export const periodQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
});

/** Top-N query (top products, etc.). */
export const topQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

/** Low-stock threshold query. */
export const lowStockQuerySchema = z.object({
  threshold: z.coerce.number().int().min(0).default(10),
});
