import { ProductRepository } from './product.repository.js';
import { NotFoundError } from '../../common/errors/not-found.error.js';
import { ConflictError } from '../../common/errors/conflict.error.js';
import { buildPaginationMeta, type PaginationParams } from '../../common/helpers/pagination.js';

export class ProductService {
  constructor(private readonly repository = new ProductRepository()) {}

  async getAll(params: PaginationParams, filters?: { categoryId?: number; search?: string }) {
    const { rows, count } = await this.repository.findAll(params, { isActive: true, ...filters });
    return { data: rows, meta: buildPaginationMeta(count, params) };
  }

  async getById(id: string) {
    const product = await this.repository.findById(id);
    if (!product) throw new NotFoundError('Producto');
    return product;
  }

  /** Find product by barcode/QR code — used at POS for scanning */
  async getByCode(code: string) {
    const product = await this.repository.findByCode(code);
    if (!product) throw new NotFoundError('Producto');
    return product;
  }

  async create(data: { code: string; [key: string]: unknown }) {
    const existing = await this.repository.findByCode(data.code);
    if (existing) throw new ConflictError('El código de producto ya existe');
    return this.repository.create(data as any);
  }

  async update(id: string, data: Record<string, unknown>) {
    if (data.code && typeof data.code === 'string') {
      const existing = await this.repository.findByCode(data.code);
      if (existing && existing.id !== id) throw new ConflictError('El código de producto ya existe');
    }
    const product = await this.repository.update(id, data as any);
    if (!product) throw new NotFoundError('Producto');
    return this.repository.findById(id);
  }

  async delete(id: string) {
    const result = await this.repository.softDelete(id);
    if (!result) throw new NotFoundError('Producto');
  }
}
