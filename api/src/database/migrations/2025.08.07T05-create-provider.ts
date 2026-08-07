import { DataTypes, type QueryInterface } from 'sequelize';

/**
 * Migration: Create provider table.
 *
 * Providers are the contact persons from supplier companies.
 * A provider belongs to a company and has a document type.
 */
export async function up({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.createTable('provider', {
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
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    document_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'document_type', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'company', key: 'id' },
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

  await queryInterface.addIndex('provider', ['company_id'], { name: 'idx_provider_company' });
}

export async function down({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.dropTable('provider');
}
