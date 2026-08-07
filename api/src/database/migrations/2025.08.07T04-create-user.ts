import { DataTypes, type QueryInterface } from 'sequelize';

/**
 * Migration: Create user table.
 *
 * Users are the system operators (admins, sellers).
 * - Email is unique (used for login)
 * - Password stored as bcrypt hash (never plain text)
 * - References role and document_type tables
 * - `is_active` for soft delete (deactivated users can't login)
 */
export async function up({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.createTable('user', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    first_name: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    identity_document: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'role', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    document_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'document_type', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Indexes for frequently queried fields
  await queryInterface.addIndex('user', ['email'], { name: 'idx_user_email' });
  await queryInterface.addIndex('user', ['role_id'], { name: 'idx_user_role' });
}

export async function down({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.dropTable('user');
}
