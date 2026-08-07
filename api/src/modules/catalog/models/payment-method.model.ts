import { Table, Column, Model, DataType } from 'sequelize-typescript';

/**
 * PaymentMethod model — accepted payment methods.
 *
 * Used in sales to record how the customer paid.
 * Also used in cash register summaries to break down totals.
 */
@Table({
  tableName: 'payment_method',
  timestamps: false,
})
export class PaymentMethod extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
    unique: true,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'display_name',
  })
  declare displayName: string;
}
