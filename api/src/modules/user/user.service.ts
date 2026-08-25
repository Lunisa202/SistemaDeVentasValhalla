import bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { NotFoundError } from '../../common/errors/not-found.error';
import { ConflictError } from '../../common/errors/conflict.error';
import { buildPaginationMeta, type PaginationParams } from '../../common/helpers/pagination';
import type { CreateUserDto, UpdateUserDto } from './user.dto';

/**
 * UserService — business logic for user management.
 *
 * Principle: Dependency Inversion — depends on repository abstraction.
 * Principle: Single Responsibility — only business rules, no HTTP.
 */
export class UserService {
  constructor(private readonly repository = new UserRepository()) {}

  async getAll(params: PaginationParams) {
    const { rows, count } = await this.repository.findAll(params, { isActive: true });
    return { data: rows, meta: buildPaginationMeta(count, params) };
  }

  async getById(id: string) {
    const user = await this.repository.findById(id);
    if (!user) throw new NotFoundError('Usuario');
    return user;
  }

  async create(data: CreateUserDto) {
    // Check for duplicate email
    const existing = await this.repository.findByEmail(data.email);
    if (existing) throw new ConflictError('El email ya está registrado');

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await this.repository.create({ ...data, password: hashedPassword });
    // Return without password — fetch with includes
    return this.repository.findById(user.id);
  }

  async update(id: string, data: UpdateUserDto) {
    const updateData = { ...data };

    // If updating password, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12);
    }

    // If updating email, check for conflicts
    if (updateData.email) {
      const existing = await this.repository.findByEmail(updateData.email);
      if (existing && existing.id !== id) {
        throw new ConflictError('El email ya está registrado');
      }
    }

    const user = await this.repository.update(id, updateData);
    if (!user) throw new NotFoundError('Usuario');
    return this.repository.findById(id); // Return with includes, without password
  }

  async delete(id: string) {
    const result = await this.repository.softDelete(id);
    if (!result) throw new NotFoundError('Usuario');
  }
}
