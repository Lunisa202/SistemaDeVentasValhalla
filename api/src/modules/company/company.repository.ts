import { Company } from './company.model.js';
import { getOffset, type PaginationParams } from '../../common/helpers/pagination.js';

export class CompanyRepository {
  async findAll(params: PaginationParams, filters?: { isActive?: boolean }) {
    const where: Record<string, unknown> = {};
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    return Company.findAndCountAll({
      where,
      limit: params.limit,
      offset: getOffset(params),
      order: [['created_at', 'DESC']],
    });
  }

  async findById(id: string) {
    return Company.findByPk(id);
  }

  async findByTaxId(taxId: string) {
    return Company.findOne({ where: { taxId } });
  }

  async create(data: Partial<Company>) {
    return Company.create(data as any);
  }

  async update(id: string, data: Partial<Company>) {
    const company = await Company.findByPk(id);
    if (!company) return null;
    return company.update(data);
  }

  async softDelete(id: string) {
    const company = await Company.findByPk(id);
    if (!company) return null;
    return company.update({ isActive: false });
  }
}
