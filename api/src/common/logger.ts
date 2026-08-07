import pino from 'pino';

/**
 * Application logger using Pino.
 *
 * Why Pino over Winston?
 * - 5x faster (important for high-throughput APIs)
 * - JSON output by default (ideal for Docker/cloud log aggregators)
 * - In development, `pino-pretty` formats logs readably
 *
 * Usage:
 *   import { logger } from '@common/logger';
 *   logger.info('Server started');
 *   logger.error({ err, userId }, 'Failed to create user');
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});
