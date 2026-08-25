import { ProductRepository } from './product.repository';
import { NotFoundError } from '../../common/errors/not-found.error';
import { ConflictError } from '../../common/errors/conflict.error';
import { buildPaginationMeta, type PaginationParams } from '../../common/helpers/pagination';
import type { CreateProductDto, UpdateProductDto } from './product.dto';

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

  async create(data: CreateProductDto) {
    const existing = await this.repository.findByCode(data.code);
    if (existing) throw new ConflictError('El código de producto ya existe');
    return this.repository.create(data);
  }

  async update(id: string, data: UpdateProductDto) {
    if (data.code) {
      const existing = await this.repository.findByCode(data.code);
      if (existing && existing.id !== id) throw new ConflictError('El código de producto ya existe');
    }
    const product = await this.repository.update(id, data);
    if (!product) throw new NotFoundError('Producto');
    return this.repository.findById(id);
  }

  async delete(id: string) {
    const result = await this.repository.softDelete(id);
    if (!result) throw new NotFoundError('Producto');
  }
}
