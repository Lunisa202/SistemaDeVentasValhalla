/**
 * Database connection check.
 *
 * Used by bootstrap.mjs to verify the DB accepts connections
 * before running migrations. Exits 0 on success, 1 on failure.
 */
import { sequelize } from '../src/config/database';

try {
  await sequelize.authenticate();
  await sequelize.close();
  process.exit(0);
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
