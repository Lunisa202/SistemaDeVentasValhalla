import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../user/user.model.js';

/**
 * RefreshToken model — stores JWT refresh tokens.
 *
 * Each token belongs to a user and has an expiration date.
 * - A user can have multiple active tokens (multi-device login)
 * - `revokedAt` is set on logout → invalidates the token
 * - Expired or revoked tokens are rejected on refresh attempts
 *
 * Security: tokens are stored hashed or as opaque strings.
 * The actual token value is only sent to the client once (in a httpOnly cookie).
 */
@Table({
  tableName: 'refresh_token',
  timestamps: false,
})
export class RefreshToken extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  declare userId: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
    unique: true,
  })
  declare token: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'expires_at',
  })
  declare expiresAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'created_at',
  })
  declare createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'revoked_at',
  })
  declare revokedAt: Date | null;

  // Relationships
  @BelongsTo(() => User)
  declare user: User;
}
