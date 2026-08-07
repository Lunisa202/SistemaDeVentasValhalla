import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from '../user/user.model.js';
import { Provider } from '../provider/provider.model.js';
import { PurchaseDetail } from './purchase-detail.model.js';

/**
 * Purchase model — stock acquisition from providers.
 *
 * A purchase represents buying products from a provider to restock inventory.
 * It has a 1:N relationship with PurchaseDetail (line items).
 *
 * Workflow:
 * 1. User creates purchase with product details
 * 2. System creates PurchaseDetail records
 * 3. Stock is increased for each product in the details
 * 4. Total is calculated from detail subtotals
 */
@Table({
  tableName: 'purchase',
  timestamps: false,
})
export class Purchase extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  declare userId: string;

  @ForeignKey(() => Provider)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'provider_id',
  })
  declare providerId: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
    field: 'voucher_type',
  })
  declare voucherType: 'RECEIPT' | 'INVOICE' | 'TICKET';

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  declare total: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'purchased_at',
  })
  declare purchasedAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'created_at',
  })
  declare createdAt: Date;

  // Relationships
  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Provider)
  declare provider: Provider;

  @HasMany(() => PurchaseDetail)
  declare details: PurchaseDetail[];
}
