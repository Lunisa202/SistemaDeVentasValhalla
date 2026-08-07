import type { QueryInterface } from 'sequelize';

/**
 * Seeder: Insert initial reference data.
 *
 * This data is required for the system to function.
 * Uses bulkInsert which is idempotent when combined with
 * the SequelizeSeederMeta tracking table.
 */
export async function up({ context: queryInterface }: { context: QueryInterface }) {
  // ─── Roles ────────────────────────────────────────────
  await queryInterface.bulkInsert('role', [
    { name: 'admin', display_name: 'Administrador' },
    { name: 'seller', display_name: 'Vendedor' },
  ]);

  // ─── Document Types ───────────────────────────────────
  await queryInterface.bulkInsert('document_type', [
    { name: 'DNI', display_name: 'DNI' },
    { name: 'PASSPORT', display_name: 'Pasaporte' },
    { name: 'FOREIGNER_ID', display_name: 'Carnet de Extranjería' },
    { name: 'OTHER', display_name: 'Otro' },
  ]);

  // ─── Payment Methods ──────────────────────────────────
  await queryInterface.bulkInsert('payment_method', [
    { name: 'cash', display_name: 'Efectivo' },
    { name: 'yape', display_name: 'Yape' },
    { name: 'plin', display_name: 'Plin' },
    { name: 'debit_card', display_name: 'Tarjeta débito' },
    { name: 'credit_card', display_name: 'Tarjeta de crédito' },
  ]);

  // ─── Product Categories ───────────────────────────────
  await queryInterface.bulkInsert('product_category', [
    { name: 'Gaseosas', description: 'Bebidas carbonatadas y azucaradas', created_at: new Date(), updated_at: new Date() },
    { name: 'Licores', description: 'Bebidas alcohólicas', created_at: new Date(), updated_at: new Date() },
    { name: 'Piqueos', description: 'Snacks salados', created_at: new Date(), updated_at: new Date() },
    { name: 'Golosinas', description: 'Dulces y otros', created_at: new Date(), updated_at: new Date() },
    { name: 'Bebidas no alcohólicas', description: 'Todo tipo de bebidas sin alcohol', created_at: new Date(), updated_at: new Date() },
  ]);
}

export async function down({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.bulkDelete('product_category', {});
  await queryInterface.bulkDelete('payment_method', {});
  await queryInterface.bulkDelete('document_type', {});
  await queryInterface.bulkDelete('role', {});
}
