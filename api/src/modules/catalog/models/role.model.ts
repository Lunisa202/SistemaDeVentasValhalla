import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { User } from '../../user/user.model.js';

/**
 * Role model — defines system roles (admin, seller).
 *
 * This is a reference/catalog table. Its data rarely changes
 * and is seeded at deployment time.
 *
 * Fields:
 * - `name`: internal identifier in English (used in code logic, JWT payload)
 * - `displayName`: human-readable label in Spanish (sent to frontend for UI)
 */
@Table({
  tableName: 'role',
  timestamps: false,
})
export class Role extends Model {
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

  // Relationships
  @HasMany(() => User)
  declare users: User[];
}
