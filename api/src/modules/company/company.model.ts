import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Provider } from '../provider/provider.model.js';

/**
 * Company model — supplier businesses.
 *
 * A company is identified by its tax_id (RUC in Peru).
 * Providers (contact persons) belong to a company.
 *
 * Soft delete via `isActive` — deactivated companies are hidden
 * from listings but preserved for historical purchase records.
 */
@Table({
  tableName: 'company',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Company extends Model {
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
    type: DataType.STRING(25),
    allowNull: false,
    unique: true,
    field: 'tax_id',
  })
  declare taxId: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
  })
  declare isActive: boolean;

  // Relationships
  @HasMany(() => Provider)
  declare providers: Provider[];
}
