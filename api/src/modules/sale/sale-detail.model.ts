import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Sale } from './sale.model.js';
import { Product } from '../product/product.model.js';

/**
 * SaleDetail model — line items of a sale.
 *
 * Each record represents one product sold in a transaction.
 * - `unitPrice` captures the price at the time of sale (historical)
 * - `subtotal` is GENERATED (quantity * unit_price) — read only
 */
@Table({
  tableName: 'sale_detail',
  timestamps: false,
})
export class SaleDetail extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => Sale)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'sale_id',
  })
  declare saleId: number;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'product_id',
  })
  declare productId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare quantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'unit_price',
  })
  declare unitPrice: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  declare subtotal: number; // GENERATED column — read only

  // Relationships
  @BelongsTo(() => Sale)
  declare sale: Sale;

  @BelongsTo(() => Product)
  declare product: Product;
}
