import { DataTypes, type QueryInterface } from 'sequelize';

/**
 * Migration: Create refresh_token table.
 *
 * Stores refresh tokens for the JWT auth flow.
 * - Each user can have multiple active refresh tokens (multi-device)
 * - `revoked_at` marks a token as invalidated (on logout)
 * - `expires_at` is checked on refresh — expired tokens are rejected
 * - ON DELETE CASCADE: if a user is deleted, all their tokens go too
 */
export async function up({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.createTable('refresh_token', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'user', key: 'id' },
      onDelete: 'CASCADE',
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    revoked_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  await queryInterface.addIndex('refresh_token', ['user_id'], { name: 'idx_refresh_token_user' });
  await queryInterface.addIndex('refresh_token', ['expires_at'], { name: 'idx_refresh_token_expires' });
}

export async function down({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.dropTable('refresh_token');
}
