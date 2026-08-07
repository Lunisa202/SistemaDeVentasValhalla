import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { DocumentType } from '../catalog/models/document-type.model.js';
import { Company } from '../company/company.model.js';

/**
 * Provider model — contact persons from supplier companies.
 *
 * A provider belongs to a company and is linked via document type.
 * They are referenced in purchases as the supplier contact.
 */
@Table({
  tableName: 'provider',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Provider extends Model {
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
    type: DataType.STRING(20),
    allowNull: false,
    field: 'identity_document',
  })
  declare identityDocument: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare email: string;

  @Column({
    type: DataType.STRING(15),
    allowNull: false,
  })
  declare phone: string;

  @ForeignKey(() => DocumentType)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'document_type_id',
  })
  declare documentTypeId: number;

  @ForeignKey(() => Company)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'company_id',
  })
  declare companyId: string;

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

  @BelongsTo(() => Company)
  declare company: Company;
}
