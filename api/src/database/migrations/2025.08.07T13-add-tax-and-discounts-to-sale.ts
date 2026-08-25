import { DataTypes, type QueryInterface } from 'sequelize';

/**
 * Migration: Add IGV (tax) and discount fields to sale tables.
 *
 * Peru context:
 * - IGV = 18% (Impuesto General a las Ventas)
 * - Prices shown to customers already INCLUDE IGV
 * - On the receipt, you decompose: total = tax_base + tax_amount
 * - Formula: tax_base = total / 1.18, tax_amount = total - tax_base
 *
 * Discounts:
 * - Per item: discount_percent on each sale_detail line
 * - Global: discount_amount on the entire sale
 */
export async function up({ context: queryInterface }: { context: QueryInterface }) {
  const sequelize = queryInterface.sequelize;

  // Add discount_percent to sale_detail
  await queryInterface.addColumn('sale_detail', 'discount_percent', {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
  });

  // Drop the old generated subtotal and recreate with discount
  await sequelize.query(`ALTER TABLE sale_detail DROP COLUMN subtotal;`);
  await sequelize.query(`
    ALTER TABLE sale_detail ADD COLUMN subtotal DECIMAL(10,2) 
    GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_percent / 100)) STORED;
  `);

  // Add tax/discount fields to sale
  await queryInterface.addColumn('sale', 'subtotal', {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  });

  await queryInterface.addColumn('sale', 'discount_amount', {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  });

  await queryInterface.addColumn('sale', 'tax_base', {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  });

  await queryInterface.addColumn('sale', 'tax_amount', {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  });

  // Add CHECK constraint for discount_percent
  await sequelize.query(`ALTER TABLE sale_detail ADD CONSTRAINT chk_sale_detail_discount CHECK (discount_percent >= 0 AND discount_percent <= 100);`);
  await sequelize.query(`ALTER TABLE sale ADD CONSTRAINT chk_sale_discount CHECK (discount_amount >= 0);`);
}

export async function down({ context: queryInterface }: { context: QueryInterface }) {
  const sequelize = queryInterface.sequelize;

  // Remove sale columns
  await queryInterface.removeColumn('sale', 'tax_amount');
  await queryInterface.removeColumn('sale', 'tax_base');
  await queryInterface.removeColumn('sale', 'discount_amount');
  await queryInterface.removeColumn('sale', 'subtotal');

  // Remove discount from sale_detail and restore original subtotal
  await sequelize.query(`ALTER TABLE sale_detail DROP CONSTRAINT IF EXISTS chk_sale_detail_discount;`);
  await sequelize.query(`ALTER TABLE sale_detail DROP COLUMN subtotal;`);
  await sequelize.query(`ALTER TABLE sale_detail DROP COLUMN discount_percent;`);
  await sequelize.query(`ALTER TABLE sale_detail ADD COLUMN subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED;`);
}
