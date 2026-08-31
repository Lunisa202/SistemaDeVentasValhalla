import { QueryTypes, type QueryInterface } from 'sequelize';

/**
 * Seeder: Insert initial reference data.
 *
 * This data is required for the system to function.
 *
 * Idempotency strategy (double-layered):
 * 1. SequelizeSeederMeta tracking prevents re-running on normal restarts.
 * 2. Each insert checks existence first (defensive). If the tracking table
 *    is ever lost or reset, re-running this seeder will NOT create duplicates
 *    nor crash on UNIQUE constraints (role.name, document_type.name, etc.).
 */

/**
 * Insert rows only if the reference value (by `name`) doesn't already exist.
 * Works for tables that have a unique `name` column.
 */
async function insertIfMissing(
  queryInterface: QueryInterface,
  table: string,
  rows: Array<Record<string, unknown>>,
) {
  for (const row of rows) {
    const existing = await queryInterface.sequelize.query(
      `SELECT 1 FROM "${table}" WHERE name = :name LIMIT 1`,
      { replacements: { name: row.name }, type: QueryTypes.SELECT },
    );

    if (existing.length === 0) {
      await queryInterface.bulkInsert(table, [row]);
    }
  }
}

export async function up({ context: queryInterface }: { context: QueryInterface }) {
  // ─── Roles ────────────────────────────────────────────
  await insertIfMissing(queryInterface, 'role', [
    { name: 'admin', display_name: 'Administrador' },
    { name: 'seller', display_name: 'Vendedor' },
  ]);

  // ─── Document Types ───────────────────────────────────
  await insertIfMissing(queryInterface, 'document_type', [
    { name: 'DNI', display_name: 'DNI' },
    { name: 'PASSPORT', display_name: 'Pasaporte' },
    { name: 'FOREIGNER_ID', display_name: 'Carnet de Extranjería' },
    { name: 'OTHER', display_name: 'Otro' },
  ]);

  // ─── Payment Methods ──────────────────────────────────
  await insertIfMissing(queryInterface, 'payment_method', [
    { name: 'cash', display_name: 'Efectivo' },
    { name: 'yape', display_name: 'Yape' },
    { name: 'plin', display_name: 'Plin' },
    { name: 'debit_card', display_name: 'Tarjeta débito' },
    { name: 'credit_card', display_name: 'Tarjeta de crédito' },
  ]);

  // ─── Product Categories ───────────────────────────────
  // product_category has no UNIQUE constraint on name, so we guard explicitly.
  await insertIfMissing(queryInterface, 'product_category', [
    {
      name: 'Gaseosas',
      description: 'Bebidas carbonatadas y azucaradas',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'Licores',
      description: 'Bebidas alcohólicas',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'Piqueos',
      description: 'Snacks salados',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'Golosinas',
      description: 'Dulces y otros',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'Bebidas no alcohólicas',
      description: 'Todo tipo de bebidas sin alcohol',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
}

export async function down({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.bulkDelete('product_category', {});
  await queryInterface.bulkDelete('payment_method', {});
  await queryInterface.bulkDelete('document_type', {});
  await queryInterface.bulkDelete('role', {});
}
