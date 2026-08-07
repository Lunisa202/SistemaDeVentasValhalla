import { DataTypes, type QueryInterface } from 'sequelize';

/**
 * Migration: Create sale and sale_detail tables.
 *
 * Sales represent customer transactions.
 * - A sale is linked to a cash_register (required when cash register is open)
 * - client_id is nullable (anonymous/walk-in sales)
 * - seller_id references the user who made the sale
 * - sale_channel: IN_STORE or ONLINE
 * - `subtotal` in details is a GENERATED column
 */
export async function up({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.createTable('sale', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    client_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'client', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    seller_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'user', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    cash_register_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'cash_register', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    voucher_type: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    voucher_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    sale_channel: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    payment_method_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'payment_method', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    sold_at: {
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

  // Cast string columns to ENUM types
  const sequelize = queryInterface.sequelize;
  await sequelize.query(`ALTER TABLE sale ALTER COLUMN voucher_type TYPE voucher_type USING voucher_type::voucher_type;`);
  await sequelize.query(`ALTER TABLE sale ALTER COLUMN sale_channel TYPE sale_channel USING sale_channel::sale_channel;`);

  // Sale detail
  await queryInterface.createTable('sale_detail', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sale_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'sale', key: 'id' },
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

  // Generated column and constraints
  await sequelize.query(`ALTER TABLE sale_detail ADD COLUMN subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED;`);
  await sequelize.query(`ALTER TABLE sale_detail ADD CONSTRAINT chk_sale_detail_qty CHECK (quantity > 0);`);
  await sequelize.query(`ALTER TABLE sale_detail ADD CONSTRAINT chk_sale_detail_price CHECK (unit_price > 0);`);

  // Indexes
  await queryInterface.addIndex('sale', ['seller_id'], { name: 'idx_sale_seller' });
  await queryInterface.addIndex('sale', ['client_id'], { name: 'idx_sale_client' });
  await queryInterface.addIndex('sale', ['sold_at'], { name: 'idx_sale_date' });
  await queryInterface.addIndex('sale', ['cash_register_id'], { name: 'idx_sale_cash_register' });
  await queryInterface.addIndex('sale_detail', ['sale_id'], { name: 'idx_sale_detail_sale' });
}

export async function down({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.dropTable('sale_detail');
  await queryInterface.dropTable('sale');
}
