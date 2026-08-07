import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Client } from '../client/client.model.js';
import { User } from '../user/user.model.js';
import { PaymentMethod } from '../catalog/models/payment-method.model.js';
import { SaleDetail } from './sale-detail.model.js';

/**
 * Sale model — customer transactions.
 *
 * A sale represents selling products to a customer.
 * - Linked to the active cash register at the time of creation
 * - client_id is nullable (anonymous/walk-in sales)
 * - seller_id is the user who processed the sale
 *
 * Workflow:
 * 1. Cash register must be OPEN
 * 2. User creates sale with product details
 * 3. System creates SaleDetail records
 * 4. Stock is decreased for each product
 * 5. Total is calculated from detail subtotals
 */
@Table({
  tableName: 'sale',
  timestamps: false,
})
export class Sale extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => Client)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'client_id',
  })
  declare clientId: string | null;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'seller_id',
  })
  declare sellerId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'cash_register_id',
  })
  declare cashRegisterId: number | null;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
    field: 'voucher_type',
  })
  declare voucherType: 'RECEIPT' | 'INVOICE' | 'TICKET';

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
    field: 'voucher_code',
  })
  declare voucherCode: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
    field: 'sale_channel',
  })
  declare saleChannel: 'IN_STORE' | 'ONLINE';

  @ForeignKey(() => PaymentMethod)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'payment_method_id',
  })
  declare paymentMethodId: number;

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
    field: 'sold_at',
  })
  declare soldAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'created_at',
  })
  declare createdAt: Date;

  // Relationships
  @BelongsTo(() => Client)
  declare client: Client | null;

  @BelongsTo(() => User)
  declare seller: User;

  @BelongsTo(() => PaymentMethod)
  declare paymentMethod: PaymentMethod;

  @HasMany(() => SaleDetail)
  declare details: SaleDetail[];
}
