import { CompanyRepository } from './company.repository';
import { NotFoundError } from '../../common/errors/not-found.error';
import { ConflictError } from '../../common/errors/conflict.error';
import { buildPaginationMeta, type PaginationParams } from '../../common/helpers/pagination';
import type { CreateCompanyDto, UpdateCompanyDto } from './company.dto';

export class CompanyService {
  constructor(private readonly repository = new CompanyRepository()) {}

  async getAll(params: PaginationParams, search?: string) {
    const { rows, count } = await this.repository.findAll(params, { isActive: true, search });
    return { data: rows, meta: buildPaginationMeta(count, params) };
  }

  async getById(id: string) {
    const company = await this.repository.findById(id);
    if (!company) throw new NotFoundError('Empresa');
    return company;
  }

  async create(data: CreateCompanyDto) {
    const existing = await this.repository.findByTaxId(data.taxId);
    if (existing) throw new ConflictError('El RUC ya está registrado');
    return this.repository.create(data);
  }

  async update(id: string, data: UpdateCompanyDto) {
    if (data.taxId) {
      const existing = await this.repository.findByTaxId(data.taxId);
      if (existing && existing.id !== id) throw new ConflictError('El RUC ya está registrado');
    }
    const company = await this.repository.update(id, data);
    if (!company) throw new NotFoundError('Empresa');
    return company;
  }

  async delete(id: string) {
    const result = await this.repository.softDelete(id);
    if (!result) throw new NotFoundError('Empresa');
  }
}
