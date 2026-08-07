import { DataTypes, type QueryInterface } from 'sequelize';

/**
 * Migration: Create cash register tables.
 *
 * A cash register represents a working session (open → sales → close).
 * - Only ONE can be OPEN at a time (enforced in application logic)
 * - On close, the system calculates expected amounts per payment method
 * - The user inputs the actual counted amount → difference = sobrante/faltante
 *
 * cash_register_summary breaks down totals by payment method for the close report.
 */
export async function up({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.createTable('cash_register', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    opened_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'user', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    closed_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'user', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    opening_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    expected_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    actual_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    difference: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'OPEN',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    opened_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    closed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  // CHECK constraint for status
  const sequelize = queryInterface.sequelize;
  await sequelize.query(`ALTER TABLE cash_register ADD CONSTRAINT chk_cash_register_status CHECK (status IN ('OPEN', 'CLOSED'));`);

  // Summary table
  await queryInterface.createTable('cash_register_summary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cash_register_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'cash_register', key: 'id' },
      onDelete: 'CASCADE',
    },
    payment_method_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'payment_method', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    total_sales: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    transaction_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  });

  // Unique constraint: one entry per payment method per cash register
  await queryInterface.addIndex('cash_register_summary', ['cash_register_id', 'payment_method_id'], {
    name: 'idx_cash_summary_unique',
    unique: true,
  });

  // Indexes
  await queryInterface.addIndex('cash_register', ['status'], { name: 'idx_cash_register_status' });
  await queryInterface.addIndex('cash_register', ['opened_at'], { name: 'idx_cash_register_opened_at' });
}

export async function down({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.dropTable('cash_register_summary');
  await queryInterface.dropTable('cash_register');
}
