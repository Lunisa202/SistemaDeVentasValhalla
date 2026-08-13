import bcrypt from 'bcrypt';
import { UserRepository } from './user.repository.js';
import { NotFoundError } from '../../common/errors/not-found.error.js';
import { ConflictError } from '../../common/errors/conflict.error.js';
import { buildPaginationMeta, type PaginationParams } from '../../common/helpers/pagination.js';

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

  async create(data: { email: string; password: string; [key: string]: unknown }) {
    // Check for duplicate email
    const existing = await this.repository.findByEmail(data.email);
    if (existing) throw new ConflictError('El email ya está registrado');

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    return this.repository.create({ ...data, password: hashedPassword } as any);
  }

  async update(id: string, data: Record<string, unknown>) {
    // If updating password, hash it
    if (data.password && typeof data.password === 'string') {
      data.password = await bcrypt.hash(data.password, 12);
    }

    // If updating email, check for conflicts
    if (data.email && typeof data.email === 'string') {
      const existing = await this.repository.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new ConflictError('El email ya está registrado');
      }
    }

    const user = await this.repository.update(id, data as any);
    if (!user) throw new NotFoundError('Usuario');
    return this.repository.findById(id); // Return with includes, without password
  }

  async delete(id: string) {
    const result = await this.repository.softDelete(id);
    if (!result) throw new NotFoundError('Usuario');
  }
}
