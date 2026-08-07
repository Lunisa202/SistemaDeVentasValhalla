import { DataTypes, type QueryInterface } from 'sequelize';

/**
 * Migration: Create client table.
 *
 * Clients are the customers who buy products.
 * - phone and email are optional (walk-in customers may not provide them)
 * - identity_document is required for receipts/invoices (tax compliance)
 */
export async function up({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.createTable('client', {
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
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    document_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'document_type', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    identity_document: {
      type: DataTypes.STRING(20),
      allowNull: false,
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

  await queryInterface.addIndex('client', ['identity_document'], { name: 'idx_client_document' });
}

export async function down({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.dropTable('client');
}
