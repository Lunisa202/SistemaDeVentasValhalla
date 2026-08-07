import { Sequelize } from 'sequelize-typescript';
import { environment } from './environment.js';
import { logger } from '../common/logger.js';

/**
 * Sequelize instance configured for PostgreSQL.
 * Uses sequelize-typescript which allows decorators in models.
 *
 * The `models` array will be populated as we create model files.
 * sequelize-typescript auto-discovers models when you pass the path.
 */
export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: environment.DB_HOST,
  port: environment.DB_PORT,
  database: environment.DB_NAME,
  username: environment.DB_USER,
  password: environment.DB_PASS,
  logging: environment.NODE_ENV === 'development'
    ? (msg) => logger.debug(msg)
    : false,
  define: {
    timestamps: true,
    underscored: true,     // camelCase in JS → snake_case in DB
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: environment.NODE_ENV === 'production'
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
});

/**
 * Initialize database connection and register models.
 * Called once at server startup (bootstrap).
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully');
  } catch (error) {
    logger.fatal({ err: error }, '❌ Unable to connect to database');
    throw error;
  }
}
