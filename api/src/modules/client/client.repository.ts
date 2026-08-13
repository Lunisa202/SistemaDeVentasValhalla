import { Client } from './client.model.js';
import { DocumentType } from '../catalog/models/document-type.model.js';
import { getOffset, type PaginationParams } from '../../common/helpers/pagination.js';
import { Op } from 'sequelize';

export class ClientRepository {
  private readonly defaultInclude = [
    { model: DocumentType, as: 'documentType', attributes: ['id', 'name', 'displayName'] },
  ];

  async findAll(params: PaginationParams, filters?: { isActive?: boolean; search?: string }) {
    const where: Record<string, unknown> = {};
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    if (filters?.search) {
      where[Op.or as any] = [
        { firstName: { [Op.iLike]: `%${filters.search}%` } },
        { lastName: { [Op.iLike]: `%${filters.search}%` } },
        { identityDocument: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    return Client.findAndCountAll({
      where,
      include: this.defaultInclude,
      limit: params.limit,
      offset: getOffset(params),
      order: [['created_at', 'DESC']],
    });
  }

  async findById(id: string) {
    return Client.findByPk(id, { include: this.defaultInclude });
  }

  async create(data: Partial<Client>) {
    return Client.create(data as any);
  }

  async update(id: string, data: Partial<Client>) {
    const client = await Client.findByPk(id);
    if (!client) return null;
    return client.update(data);
  }

  async softDelete(id: string) {
    const client = await Client.findByPk(id);
    if (!client) return null;
    return client.update({ isActive: false });
  }
}
