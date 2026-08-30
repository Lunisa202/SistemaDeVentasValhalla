import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { CashRegister } from './cash-register.model';
import { PaymentMethod } from '../catalog/models/payment-method.model';

/**
 * CashRegisterSummary model — sales breakdown per payment method.
 *
 * Generated when a cash register is CLOSED. One row per payment method
 * that had sales during the session. Powers the close report:
 * "Efectivo: S/. 340.00 (12 ventas), Yape: S/. 120.00 (5 ventas)..."
 *
 * Unique constraint: (cash_register_id, payment_method_id) — one row
 * per payment method per register.
 */
@Table({
  tableName: 'cash_register_summary',
  timestamps: false,
})
export class CashRegisterSummary extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => CashRegister)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'cash_register_id',
  })
  declare cashRegisterId: number;

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
    field: 'total_sales',
  })
  declare totalSales: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'transaction_count',
  })
  declare transactionCount: number;

  // Relationships
  @BelongsTo(() => CashRegister)
  declare cashRegister: CashRegister;

  @BelongsTo(() => PaymentMethod)
  declare paymentMethod: PaymentMethod;
}
