/**
 * Migration runner using umzug.
 *
 * Umzug is the library that Sequelize uses internally for migrations,
 * but exposed directly gives us TypeScript support and full control.
 *
 * Run with: pnpm run migrate
 *
 * How it works:
 * 1. Looks for migration files in src/database/migrations/
 * 2. Tracks which ones have been run in a `SequelizeMeta` table
 * 3. Runs pending migrations in order (by filename timestamp)
 * 4. Each migration has an `up` (apply) and `down` (revert) function
 */
import { Umzug, SequelizeStorage } from 'umzug';
import { sequelize } from '../config/database.js';
import { logger } from '../common/logger.js';

export const migrator = new Umzug({
  migrations: {
    glob: 'src/database/migrations/*.ts',
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: {
    info: (msg) => logger.info(msg),
    warn: (msg) => logger.warn(msg),
    error: (msg) => logger.error(msg),
    debug: (msg) => logger.debug(msg),
  },
});

// CLI execution
async function run() {
  const command = process.argv[2] || 'up';

  switch (command) {
    case 'up':
      logger.info('⬆️  Running pending migrations...');
      await migrator.up();
      logger.info('✅ All migrations applied');
      break;
    case 'down':
      logger.info('⬇️  Reverting last migration...');
      await migrator.down();
      logger.info('✅ Last migration reverted');
      break;
    case 'pending':
      const pending = await migrator.pending();
      logger.info(`📋 Pending migrations: ${pending.length}`);
      pending.forEach((m) => logger.info(`  - ${m.name}`));
      break;
    default:
      logger.error(`Unknown command: ${command}. Use: up, down, pending`);
  }

  await sequelize.close();
}

run().catch((err) => {
  logger.fatal('Migration failed:', err);
  process.exit(1);
});
