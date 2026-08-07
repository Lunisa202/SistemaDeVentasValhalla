import { DataTypes, type QueryInterface } from 'sequelize';

/**
 * Migration: Create reference/catalog tables.
 *
 * These are lookup tables that rarely change. They hold the "vocabulary"
 * of the system: roles, document types, payment methods, categories.
 *
 * Each has:
 * - `name`: internal identifier in English (used in code logic)
 * - `display_name`: human-readable label in Spanish (shown in UI)
 *
 * This separation follows the project rule: code in English, UI in Spanish.
 */
export async function up({ context: queryInterface }: { context: QueryInterface }) {
  // ─── Role ─────────────────────────────────────────────
  await queryInterface.createTable('role', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    display_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  });

  // ─── Document Type ────────────────────────────────────
  await queryInterface.createTable('document_type', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    display_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  });

  // ─── Payment Method ───────────────────────────────────
  await queryInterface.createTable('payment_method', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    display_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  });

  // ─── Product Category ─────────────────────────────────
  await queryInterface.createTable('product_category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(150),
      allowNull: true,
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
}

export async function down({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.dropTable('product_category');
  await queryInterface.dropTable('payment_method');
  await queryInterface.dropTable('document_type');
  await queryInterface.dropTable('role');
}
