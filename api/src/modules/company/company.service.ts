import { CompanyRepository } from './company.repository.js';
import { NotFoundError } from '../../common/errors/not-found.error.js';
import { ConflictError } from '../../common/errors/conflict.error.js';
import { buildPaginationMeta, type PaginationParams } from '../../common/helpers/pagination.js';

export class CompanyService {
  constructor(private readonly repository = new CompanyRepository()) {}

  async getAll(params: PaginationParams) {
    const { rows, count } = await this.repository.findAll(params, { isActive: true });
    return { data: rows, meta: buildPaginationMeta(count, params) };
  }

  async getById(id: string) {
    const company = await this.repository.findById(id);
    if (!company) throw new NotFoundError('Empresa');
    return company;
  }

  async create(data: { name: string; taxId: string }) {
    const existing = await this.repository.findByTaxId(data.taxId);
    if (existing) throw new ConflictError('El RUC ya está registrado');
    return this.repository.create(data as any);
  }

  async update(id: string, data: Record<string, unknown>) {
    if (data.taxId && typeof data.taxId === 'string') {
      const existing = await this.repository.findByTaxId(data.taxId);
      if (existing && existing.id !== id) throw new ConflictError('El RUC ya está registrado');
    }
    const company = await this.repository.update(id, data as any);
    if (!company) throw new NotFoundError('Empresa');
    return company;
  }

  async delete(id: string) {
    const result = await this.repository.softDelete(id);
    if (!result) throw new NotFoundError('Empresa');
  }
}
