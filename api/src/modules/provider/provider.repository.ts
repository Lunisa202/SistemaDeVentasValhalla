import { Provider } from './provider.model.js';
import { DocumentType } from '../catalog/models/document-type.model.js';
import { Company } from '../company/company.model.js';
import { getOffset, type PaginationParams } from '../../common/helpers/pagination.js';

export class ProviderRepository {
  private readonly defaultInclude = [
    { model: DocumentType, as: 'documentType', attributes: ['id', 'name', 'displayName'] },
    { model: Company, as: 'company', attributes: ['id', 'name', 'taxId'] },
  ];

  async findAll(params: PaginationParams, filters?: { isActive?: boolean; companyId?: string }) {
    const where: Record<string, unknown> = {};
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    if (filters?.companyId) where.companyId = filters.companyId;

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

  async create(data: Partial<Provider>) {
    return Provider.create(data as any);
  }

  async update(id: string, data: Partial<Provider>) {
    const provider = await Provider.findByPk(id);
    if (!provider) return null;
    return provider.update(data);
  }

  async softDelete(id: string) {
    const provider = await Provider.findByPk(id);
    if (!provider) return null;
    return provider.update({ isActive: false });
  }
}
