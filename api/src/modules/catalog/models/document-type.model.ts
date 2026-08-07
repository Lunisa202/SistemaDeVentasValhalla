import { Table, Column, Model, DataType } from 'sequelize-typescript';

/**
 * DocumentType model — identity document types (DNI, Passport, etc.).
 *
 * Used by User, Provider, and Client to identify what type of
 * identity document they registered with.
 */
@Table({
  tableName: 'document_type',
  timestamps: false,
})
export class DocumentType extends Model {
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
