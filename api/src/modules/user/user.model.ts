import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Role } from '../catalog/models/role.model.js';
import { DocumentType } from '../catalog/models/document-type.model.js';

/**
 * User model — system operators (admins, sellers).
 *
 * Users authenticate via email/password and receive a JWT.
 * Their role determines what endpoints they can access.
 *
 * Password is stored as a bcrypt hash (never plain text).
 * The password field is excluded from default queries via
 * the repository layer (never sent to frontend accidentally).
 */
@Table({
  tableName: 'user',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class User extends Model {
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
    type: DataType.STRING(15),
    allowNull: true,
  })
  declare phone: string | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare password: string;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'role_id',
  })
  declare roleId: number;

  @ForeignKey(() => DocumentType)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'document_type_id',
  })
  declare documentTypeId: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
  })
  declare isActive: boolean;

  // Relationships
  @BelongsTo(() => Role)
  declare role: Role;

  @BelongsTo(() => DocumentType)
  declare documentType: DocumentType;
}
