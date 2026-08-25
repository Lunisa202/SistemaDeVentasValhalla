import { ClientRepository } from './client.repository';
import { NotFoundError } from '../../common/errors/not-found.error';
import { buildPaginationMeta, type PaginationParams } from '../../common/helpers/pagination';
import type { CreateClientDto, UpdateClientDto } from './client.dto';

export class ClientService {
  constructor(private readonly repository = new ClientRepository()) {}

  async getAll(params: PaginationParams, search?: string) {
    const { rows, count } = await this.repository.findAll(params, { isActive: true, search });
    return { data: rows, meta: buildPaginationMeta(count, params) };
  }

  async getById(id: string) {
    const client = await this.repository.findById(id);
    if (!client) throw new NotFoundError('Cliente');
    return client;
  }

  async create(data: CreateClientDto) {
    return this.repository.create(data);
  }

  async update(id: string, data: UpdateClientDto) {
    const client = await this.repository.update(id, data);
    if (!client) throw new NotFoundError('Cliente');
    return this.repository.findById(id);
  }

  async delete(id: string) {
    const result = await this.repository.softDelete(id);
    if (!result) throw new NotFoundError('Cliente');
  }
}
