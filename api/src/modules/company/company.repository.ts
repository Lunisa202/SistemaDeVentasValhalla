import { Company } from './company.model';
import { getOffset, type PaginationParams } from '../../common/helpers/pagination';
import { Op } from 'sequelize';
import type { CreateCompanyDto, UpdateCompanyDto } from './company.dto';

export class CompanyRepository {
  async findAll(params: PaginationParams, filters?: { isActive?: boolean; search?: string }) {
    const conditions: any[] = [];

    if (filters?.isActive !== undefined) conditions.push({ isActive: filters.isActive });
    if (filters?.search) {
      conditions.push({
        [Op.or]: [
          { name: { [Op.iLike]: `%${filters.search}%` } },
          { taxId: { [Op.iLike]: `%${filters.search}%` } },
        ],
      });
    }

    const where = conditions.length > 0 ? { [Op.and]: conditions } : {};

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

  async create(data: CreateCompanyDto) {
    return Company.create(data as any);
  }

  async update(id: string, data: UpdateCompanyDto) {
    const company = await Company.findByPk(id);
    if (!company) return null;
    return company.update(data as any);
  }

  async softDelete(id: string) {
    const company = await Company.findByPk(id);
    if (!company) return null;
    return company.update({ isActive: false });
  }
}
