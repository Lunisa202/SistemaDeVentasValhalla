import { ProviderRepository } from './provider.repository.js';
import { NotFoundError } from '../../common/errors/not-found.error.js';
import { buildPaginationMeta, type PaginationParams } from '../../common/helpers/pagination.js';

export class ProviderService {
  constructor(private readonly repository = new ProviderRepository()) {}

  async getAll(params: PaginationParams, companyId?: string) {
    const { rows, count } = await this.repository.findAll(params, { isActive: true, companyId });
    return { data: rows, meta: buildPaginationMeta(count, params) };
  }

  async getById(id: string) {
    const provider = await this.repository.findById(id);
    if (!provider) throw new NotFoundError('Proveedor');
    return provider;
  }

  async create(data: Record<string, unknown>) {
    return this.repository.create(data as any);
  }

  async update(id: string, data: Record<string, unknown>) {
    const provider = await this.repository.update(id, data as any);
    if (!provider) throw new NotFoundError('Proveedor');
    return this.repository.findById(id);
  }

  async delete(id: string) {
    const result = await this.repository.softDelete(id);
    if (!result) throw new NotFoundError('Proveedor');
  }
}
