import type { PaginationMeta } from './response.js';

/**
 * Pagination parameter interface.
 * Parsed from query params: ?page=1&limit=20
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Parse pagination from query params with defaults and bounds.
 *
 * - Default page: 1
 * - Default limit: 20
 * - Max limit: 100 (prevents accidental "get all" requests)
 */
export function parsePaginationParams(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

  return { page, limit };
}

/**
 * Calculate offset for SQL queries from page/limit.
 */
export function getOffset(params: PaginationParams): number {
  return (params.page - 1) * params.limit;
}

/**
 * Build pagination metadata for the response.
 *
 * @param total - Total count of records matching the query
 * @param params - Current page and limit
 */
export function buildPaginationMeta(total: number, params: PaginationParams): PaginationMeta {
  return {
    page: params.page,
    limit: params.limit,
    total,
    totalPages: Math.ceil(total / params.limit),
  };
}
