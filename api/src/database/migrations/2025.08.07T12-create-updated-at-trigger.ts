import type { QueryInterface } from 'sequelize';

/**
 * Migration: Create automatic updated_at trigger function.
 *
 * PostgreSQL doesn't auto-update `updated_at` like some ORMs fake it.
 * This trigger runs BEFORE UPDATE on any row and sets updated_at = NOW().
 *
 * We create ONE function and attach it to all tables that have updated_at.
 * This is more reliable than relying on Sequelize hooks because it works
 * even if you update rows via raw SQL or another tool.
 */
export async function up({ context: queryInterface }: { context: QueryInterface }) {
  const sequelize = queryInterface.sequelize;

  // Create the reusable trigger function
  await sequelize.query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Attach trigger to all tables with updated_at
  const tables = ['user', 'company', 'provider', 'client', 'product', 'product_category'];

  for (const table of tables) {
    await sequelize.query(`
      CREATE TRIGGER trg_${table}_updated_at
      BEFORE UPDATE ON "${table}"
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  }
}

export async function down({ context: queryInterface }: { context: QueryInterface }) {
  const sequelize = queryInterface.sequelize;
  const tables = ['user', 'company', 'provider', 'client', 'product', 'product_category'];

  for (const table of tables) {
    await sequelize.query(`DROP TRIGGER IF EXISTS trg_${table}_updated_at ON "${table}";`);
  }

  await sequelize.query(`DROP FUNCTION IF EXISTS update_updated_at_column();`);
}
