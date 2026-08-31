import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { User } from '../user/user.model';
import { CashRegisterSummary } from './cash-register-summary.model';

/**
 * CashRegister model — a cash session (open → sales → close).
 *
 * Workflow:
 * 1. A user OPENS a register with an opening amount (float/base cash).
 * 2. Sales are recorded against the open register.
 * 3. A user CLOSES it: the system computes expected amounts per payment
 *    method, the user enters the actual counted cash, and difference is
 *    calculated (sobrante/faltante).
 *
 * Business rule: only ONE register may be OPEN at a time (enforced in
 * the service layer, not the DB).
 */
@Table({
  tableName: 'cash_register',
  timestamps: false,
})
export class CashRegister extends Model {
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
    field: 'opened_by',
  })
  declare openedBy: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'closed_by',
  })
  declare closedBy: string | null;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'opening_amount',
  })
  declare openingAmount: number;

  /** Expected cash based on sales (computed at close) */
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    field: 'expected_amount',
  })
  declare expectedAmount: number | null;

  /** Actual cash counted by the user at close */
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    field: 'actual_amount',
  })
  declare actualAmount: number | null;

  /** actual - expected (positive = sobrante, negative = faltante) */
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  declare difference: number | null;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
    defaultValue: 'OPEN',
  })
  declare status: 'OPEN' | 'CLOSED';

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare notes: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'opened_at',
  })
  declare openedAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'closed_at',
  })
  declare closedAt: Date | null;

  // Relationships
  // Two FKs to User (opener/closer) — disambiguated by the foreignKey name
  // which must match the model property, not the DB column.
  @BelongsTo(() => User, 'openedBy')
  declare openedByUser: User;

  @BelongsTo(() => User, 'closedBy')
  declare closedByUser: User | null;

  @HasMany(() => CashRegisterSummary)
  declare summaries: CashRegisterSummary[];
}
