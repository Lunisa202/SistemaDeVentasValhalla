import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Product } from '../../product/product.model.js';

/**
 * ProductCategory model — product classification.
 *
 * Categories group products for filtering and reporting.
 * Unlike other catalog tables, this one has timestamps
 * because admins can create new categories.
 */
@Table({
  tableName: 'product_category',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class ProductCategory extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(60),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(150),
    allowNull: true,
  })
  declare description: string | null;

  // Relationships
  @HasMany(() => Product)
  declare products: Product[];
}
