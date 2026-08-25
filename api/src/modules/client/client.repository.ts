import { Client } from './client.model';
import { DocumentType } from '../catalog/models/document-type.model';
import { getOffset, type PaginationParams } from '../../common/helpers/pagination';
import { Op } from 'sequelize';
import type { CreateClientDto, UpdateClientDto } from './client.dto';

export class ClientRepository {
  private readonly defaultInclude = [
    { model: DocumentType, as: 'documentType', attributes: ['id', 'name', 'displayName'] },
  ];

  async findAll(params: PaginationParams, filters?: { isActive?: boolean; search?: string }) {
    const conditions: any[] = [];

    if (filters?.isActive !== undefined) conditions.push({ isActive: filters.isActive });
    if (filters?.search) {
      conditions.push({
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${filters.search}%` } },
          { lastName: { [Op.iLike]: `%${filters.search}%` } },
          { identityDocument: { [Op.iLike]: `%${filters.search}%` } },
        ],
      });
    }

    const where = conditions.length > 0 ? { [Op.and]: conditions } : {};

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

  async create(data: CreateClientDto) {
    return Client.create(data as any);
  }

  async update(id: string, data: UpdateClientDto) {
    const client = await Client.findByPk(id);
    if (!client) return null;
    return client.update(data as any);
  }

  async softDelete(id: string) {
    const client = await Client.findByPk(id);
    if (!client) return null;
    return client.update({ isActive: false });
  }
}
