import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ProductCategory } from '../catalog/models/product-category.model.js';

/**
 * Product model — items in inventory.
 *
 * Key fields:
 * - `code`: unique barcode/QR value (used for scanning at POS)
 * - `salePrice`: current selling price (CHECK > 0 at DB level)
 * - `stock`: current quantity in inventory (CHECK >= 0 at DB level)
 *
 * Stock is modified by:
 * - Purchases (increases stock)
 * - Sales (decreases stock)
 */
@Table({
  tableName: 'product',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Product extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(13),
    allowNull: false,
    unique: true,
  })
  declare code: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'sale_price',
  })
  declare salePrice: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare stock: number;

  @ForeignKey(() => ProductCategory)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'category_id',
  })
  declare categoryId: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
  })
  declare isActive: boolean;

  // Relationships
  @BelongsTo(() => ProductCategory)
  declare category: ProductCategory;
}
