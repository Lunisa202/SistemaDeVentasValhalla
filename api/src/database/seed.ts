/**
 * Seeder runner.
 *
 * Inserts initial reference data (roles, document types, payment methods, categories).
 * Run with: pnpm run seed
 *
 * Idempotent by two layers:
 * 1. SequelizeSeederMeta tracking skips already-run seeders on restarts.
 * 2. Each seeder checks existence before inserting (SELECT ... WHERE before
 *    bulkInsert), so re-running after a tracking reset won't duplicate data
 *    nor violate UNIQUE constraints.
 */
import { Umzug, SequelizeStorage } from 'umzug';
import { sequelize } from '../config/database';
import { logger } from '../common/logger';

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
  logger.info('Running seeders...');
  await seeder.up();
  logger.info('All seeders applied');
  await sequelize.close();
}

run().catch((err) => {
  logger.fatal('Seeding failed:', err);
  process.exit(1);
});
