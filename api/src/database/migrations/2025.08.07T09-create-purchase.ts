import { DataTypes, type QueryInterface } from 'sequelize';

/**
 * Migration: Create purchase and purchase_detail tables.
 *
 * Purchases represent stock acquisitions from providers.
 * - A purchase has many details (line items)
 * - Each detail references a product and has quantity + unit price
 * - `subtotal` is a GENERATED column (calculated automatically by PostgreSQL)
 * - ON DELETE CASCADE: deleting a purchase removes its details
 */
export async function up({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.createTable('purchase', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'user', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    provider_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'provider', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    voucher_type: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    purchased_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Use raw SQL for ENUM column type cast and generated column
  const sequelize = queryInterface.sequelize;
  await sequelize.query(`ALTER TABLE purchase ALTER COLUMN voucher_type TYPE voucher_type USING voucher_type::voucher_type;`);

  await queryInterface.createTable('purchase_detail', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    purchase_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'purchase', key: 'id' },
      onDelete: 'CASCADE',
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'product', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  });

  // Add generated column and CHECK constraints via raw SQL
  await sequelize.query(`ALTER TABLE purchase_detail ADD COLUMN subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED;`);
  await sequelize.query(`ALTER TABLE purchase_detail ADD CONSTRAINT chk_purchase_detail_qty CHECK (quantity > 0);`);
  await sequelize.query(`ALTER TABLE purchase_detail ADD CONSTRAINT chk_purchase_detail_price CHECK (unit_price > 0);`);

  // Indexes
  await queryInterface.addIndex('purchase', ['user_id'], { name: 'idx_purchase_user' });
  await queryInterface.addIndex('purchase', ['provider_id'], { name: 'idx_purchase_provider' });
  await queryInterface.addIndex('purchase', ['purchased_at'], { name: 'idx_purchase_date' });
  await queryInterface.addIndex('purchase_detail', ['purchase_id'], { name: 'idx_purchase_detail_purchase' });
}

export async function down({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.dropTable('purchase_detail');
  await queryInterface.dropTable('purchase');
}
