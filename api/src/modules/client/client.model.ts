import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { DocumentType } from '../catalog/models/document-type.model.js';

/**
 * Client model — customers who buy products.
 *
 * Clients are optional in sales (walk-in/anonymous sales allowed).
 * They're required when issuing invoices (facturas) for tax purposes.
 *
 * phone and email are optional — not all walk-in customers provide them.
 */
@Table({
  tableName: 'client',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Client extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(45),
    allowNull: false,
    field: 'first_name',
  })
  declare firstName: string;

  @Column({
    type: DataType.STRING(45),
    allowNull: false,
    field: 'last_name',
  })
  declare lastName: string;

  @Column({
    type: DataType.STRING(15),
    allowNull: true,
  })
  declare phone: string | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare email: string | null;

  @ForeignKey(() => DocumentType)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'document_type_id',
  })
  declare documentTypeId: number;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    field: 'identity_document',
  })
  declare identityDocument: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
  })
  declare isActive: boolean;

  // Relationships
  @BelongsTo(() => DocumentType)
  declare documentType: DocumentType;
}
