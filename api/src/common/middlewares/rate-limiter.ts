import rateLimit from 'express-rate-limit';

/**
 * Disable rate limiting in the test environment. Integration tests fire many
 * requests quickly (multiple logins, etc.) and would otherwise hit the limit.
 * In dev/prod the limiter is fully active.
 */
const skipInTest = () => process.env.NODE_ENV === 'test';

/**
 * Rate limiter middleware.
 * Protects against brute-force attacks and abuse.
 *
 * Config: 100 requests per 15 minutes per IP.
 * Specific endpoints (like login) can have stricter limits.
 */
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per window per IP
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: skipInTest,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Demasiadas solicitudes, intenta de nuevo más tarde',
    },
  },
});

/**
 * Stricter rate limiter for auth endpoints (login, register).
 * 5 attempts per 15 minutes per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Demasiados intentos de autenticación, intenta en 15 minutos',
    },
  },
});
