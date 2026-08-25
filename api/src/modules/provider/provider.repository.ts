import { Provider } from './provider.model';
import { DocumentType } from '../catalog/models/document-type.model';
import { Company } from '../company/company.model';
import { getOffset, type PaginationParams } from '../../common/helpers/pagination';
import { Op } from 'sequelize';
import type { CreateProviderDto, UpdateProviderDto } from './provider.dto';

export class ProviderRepository {
  private readonly defaultInclude = [
    { model: DocumentType, as: 'documentType', attributes: ['id', 'name', 'displayName'] },
    { model: Company, as: 'company', attributes: ['id', 'name', 'taxId'] },
  ];

  async findAll(params: PaginationParams, filters?: { isActive?: boolean; companyId?: string; search?: string }) {
    const conditions: any[] = [];

    if (filters?.isActive !== undefined) conditions.push({ isActive: filters.isActive });
    if (filters?.companyId) conditions.push({ companyId: filters.companyId });
    if (filters?.search) {
      conditions.push({
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${filters.search}%` } },
          { lastName: { [Op.iLike]: `%${filters.search}%` } },
          { email: { [Op.iLike]: `%${filters.search}%` } },
        ],
      });
    }

    const where = conditions.length > 0 ? { [Op.and]: conditions } : {};

    return Provider.findAndCountAll({
      where,
      include: this.defaultInclude,
      limit: params.limit,
      offset: getOffset(params),
      order: [['created_at', 'DESC']],
    });
  }

  async findById(id: string) {
    return Provider.findByPk(id, { include: this.defaultInclude });
  }

  async create(data: CreateProviderDto) {
    return Provider.create(data as any);
  }

  async update(id: string, data: UpdateProviderDto) {
    const provider = await Provider.findByPk(id);
    if (!provider) return null;
    return provider.update(data as any);
  }

  async softDelete(id: string) {
    const provider = await Provider.findByPk(id);
    if (!provider) return null;
    return provider.update({ isActive: false });
  }
}
