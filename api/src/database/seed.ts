/**
 * Seeder runner.
 *
 * Inserts initial reference data (roles, document types, payment methods, categories).
 * Run with: pnpm run seed
 *
 * This is idempotent — running it twice won't create duplicates
 * because seeders use findOrCreate.
 */
import { Umzug, SequelizeStorage } from 'umzug';
import { sequelize } from '../config/database.js';
import { logger } from '../common/logger.js';

export const seeder = new Umzug({
  migrations: {
    glob: 'src/database/seeders/*.ts',
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize, modelName: 'SequelizeSeederMeta' }),
  logger: {
    info: (msg) => logger.info(msg),
    warn: (msg) => logger.warn(msg),
    error: (msg) => logger.error(msg),
    debug: (msg) => logger.debug(msg),
  },
});

async function run() {
  logger.info('🌱 Running seeders...');
  await seeder.up();
  logger.info('✅ All seeders applied');
  await sequelize.close();
}

run().catch((err) => {
  logger.fatal('Seeding failed:', err);
  process.exit(1);
});
