import type { Response } from 'express';

/**
 * Standardized API response helpers.
 *
 * Every endpoint uses these — ensures the frontend always receives
 * the same structure: { success, data, meta } or { success, error }.
 *
 * Pattern: This is a lightweight helper (not a class) because
 * it doesn't hold state — just formats and sends.
 */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Send a successful response with data.
 *
 * @param res - Express response object
 * @param data - Response payload
 * @param meta - Pagination metadata (optional)
 * @param statusCode - HTTP status (default 200)
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  meta?: PaginationMeta,
  statusCode = 200,
): void {
  res.status(statusCode).json({
    success: true,
    data,
    ...(meta && { meta }),
  });
}

/**
 * Send a 201 Created response.
 */
export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, undefined, 201);
}

/**
 * Send a 204 No Content response (successful deletion).
 */
export function sendNoContent(res: Response): void {
  res.status(204).send();
}
