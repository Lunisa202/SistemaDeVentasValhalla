import { DataTypes, type QueryInterface } from 'sequelize';

/**
 * Migration: Create product table.
 *
 * Products are the items sold in the store.
 * - `code` is the barcode/QR code (unique, used for scanning)
 * - `sale_price` has a CHECK constraint (must be positive)
 * - `stock` has a CHECK constraint (can't go negative)
 * - References product_category
 */
export async function up({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.createTable('product', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(13),
      allowNull: false,
      unique: true,
    },
    sale_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'product_category', key: 'id' },
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

  // CHECK constraints (PostgreSQL specific)
  const sequelize = queryInterface.sequelize;
  await sequelize.query(`ALTER TABLE product ADD CONSTRAINT chk_product_price CHECK (sale_price > 0);`);
  await sequelize.query(`ALTER TABLE product ADD CONSTRAINT chk_product_stock CHECK (stock >= 0);`);

  // Indexes
  await queryInterface.addIndex('product', ['code'], { name: 'idx_product_code' });
  await queryInterface.addIndex('product', ['category_id'], { name: 'idx_product_category' });
}

export async function down({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.dropTable('product');
}
