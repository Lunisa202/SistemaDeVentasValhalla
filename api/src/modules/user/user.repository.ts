import { User } from './user.model';
import { Role } from '../catalog/models/role.model';
import { DocumentType } from '../catalog/models/document-type.model';
import { getOffset, type PaginationParams } from '../../common/helpers/pagination';
import type { CreateUserDto, UpdateUserDto } from './user.dto';

/**
 * UserRepository — data access layer for users.
 *
 * Pattern: Repository — isolates DB queries from business logic.
 * If you switch ORMs or databases, only this file changes.
 *
 * Note: password is always excluded from queries (security).
 */
export class UserRepository {
  private readonly defaultInclude = [
    { model: Role, as: 'role', attributes: ['id', 'name', 'displayName'] },
    { model: DocumentType, as: 'documentType', attributes: ['id', 'name', 'displayName'] },
  ];

  async findAll(params: PaginationParams, filters?: { isActive?: boolean }) {
    const where: Record<string, unknown> = {};
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    return User.findAndCountAll({
      where,
      include: this.defaultInclude,
      attributes: { exclude: ['password'] },
      limit: params.limit,
      offset: getOffset(params),
      order: [['created_at', 'DESC']],
    });
  }

  async findById(id: string) {
    return User.findByPk(id, {
      include: this.defaultInclude,
      attributes: { exclude: ['password'] },
    });
  }

  async findByEmail(email: string) {
    return User.findOne({ where: { email } });
  }

  async create(data: CreateUserDto & { password: string }) {
    return User.create(data as any);
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await User.findByPk(id);
    if (!user) return null;
    return user.update(data as any);
  }

  async softDelete(id: string) {
    const user = await User.findByPk(id);
    if (!user) return null;
    return user.update({ isActive: false });
  }
}
