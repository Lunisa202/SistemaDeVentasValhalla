import type { QueryInterface } from 'sequelize';

/**
 * Migration: Create PostgreSQL ENUM types.
 *
 * ENUMs in PostgreSQL are custom types that restrict a column
 * to a predefined set of values. They're enforced at the DB level,
 * giving you an extra safety net beyond application validation.
 *
 * We create them first because tables reference them.
 */
export async function up({ context: queryInterface }: { context: QueryInterface }) {
  const sequelize = queryInterface.sequelize;

  await sequelize.query(`CREATE TYPE voucher_type AS ENUM ('RECEIPT', 'INVOICE', 'TICKET');`);
  await sequelize.query(`CREATE TYPE sale_channel AS ENUM ('IN_STORE', 'ONLINE');`);
}

export async function down({ context: queryInterface }: { context: QueryInterface }) {
  const sequelize = queryInterface.sequelize;

  await sequelize.query(`DROP TYPE IF EXISTS sale_channel;`);
  await sequelize.query(`DROP TYPE IF EXISTS voucher_type;`);
}
