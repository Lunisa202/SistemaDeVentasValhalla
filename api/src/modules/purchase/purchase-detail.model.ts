import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Purchase } from './purchase.model.js';
import { Product } from '../product/product.model.js';

/**
 * PurchaseDetail model — line items of a purchase.
 *
 * Each record represents one product in a purchase order.
 * - `subtotal` is a GENERATED column (quantity * unit_price) — PostgreSQL calculates it.
 * - We declare it as readonly since you can't write to generated columns.
 */
@Table({
  tableName: 'purchase_detail',
  timestamps: false,
})
export class PurchaseDetail extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => Purchase)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'purchase_id',
  })
  declare purchaseId: number;

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
  @BelongsTo(() => Purchase)
  declare purchase: Purchase;

  @BelongsTo(() => Product)
  declare product: Product;
}
