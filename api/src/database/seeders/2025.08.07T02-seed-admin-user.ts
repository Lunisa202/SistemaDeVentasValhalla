import { QueryTypes, type QueryInterface } from 'sequelize';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

/**
 * Seeder: Create default admin user.
 *
 * This ensures there's always at least one admin account to login with.
 * Password is hashed with bcrypt (12 rounds).
 *
 * Default credentials:
 *   email: admin@valhalla.com
 *   password: Admin123!
 *
 * IMPORTANT: Change this password after first login in production!
 *
 * Idempotency: checks if the admin email already exists before inserting.
 * This prevents a UNIQUE violation (user.email) if the seeder ever re-runs
 * after the SequelizeSeederMeta tracking table is lost or reset.
 */
export async function up({ context: queryInterface }: { context: QueryInterface }) {
  const existing = await queryInterface.sequelize.query(
    `SELECT 1 FROM "user" WHERE email = :email LIMIT 1`,
    { replacements: { email: 'admin@valhalla.com' }, type: QueryTypes.SELECT },
  );

  if (existing.length > 0) {
    return; // Admin already exists — nothing to do
  }

  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  await queryInterface.bulkInsert('user', [
    {
      id: uuidv4(),
      first_name: 'Admin',
      last_name: 'Valhalla',
      identity_document: '00000000',
      phone: '999999999',
      email: 'admin@valhalla.com',
      password: hashedPassword,
      role_id: 1,           // admin
      document_type_id: 1,  // DNI
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
}

export async function down({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.bulkDelete('user', { email: 'admin@valhalla.com' });
}
