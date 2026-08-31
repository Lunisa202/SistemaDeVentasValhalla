import { ProviderRepository } from './provider.repository';
import { NotFoundError } from '../../common/errors/not-found.error';
import { buildPaginationMeta, type PaginationParams } from '../../common/helpers/pagination';
import type { CreateProviderDto, UpdateProviderDto } from './provider.dto';

export class ProviderService {
  constructor(private readonly repository = new ProviderRepository()) {}

  async getAll(params: PaginationParams, companyId?: string, search?: string) {
    const { rows, count } = await this.repository.findAll(params, {
      isActive: true,
      companyId,
      search,
    });
    return { data: rows, meta: buildPaginationMeta(count, params) };
  }

  async getById(id: string) {
    const provider = await this.repository.findById(id);
    if (!provider) throw new NotFoundError('Proveedor');
    return provider;
  }

  async create(data: CreateProviderDto) {
    return this.repository.create(data);
  }

  async update(id: string, data: UpdateProviderDto) {
    const provider = await this.repository.update(id, data);
    if (!provider) throw new NotFoundError('Proveedor');
    return this.repository.findById(id);
  }

  async delete(id: string) {
    const result = await this.repository.softDelete(id);
    if (!result) throw new NotFoundError('Proveedor');
  }
}
