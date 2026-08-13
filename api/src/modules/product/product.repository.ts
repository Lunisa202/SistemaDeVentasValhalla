import { Product } from './product.model.js';
import { ProductCategory } from '../catalog/models/product-category.model.js';
import { getOffset, type PaginationParams } from '../../common/helpers/pagination.js';
import { Op } from 'sequelize';

export class ProductRepository {
  private readonly defaultInclude = [
    { model: ProductCategory, as: 'category', attributes: ['id', 'name', 'description'] },
  ];

  async findAll(params: PaginationParams, filters?: { isActive?: boolean; categoryId?: number; search?: string }) {
    const where: Record<string, unknown> = {};
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.search) {
      where[Op.or as any] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { code: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    return Product.findAndCountAll({
      where,
      include: this.defaultInclude,
      limit: params.limit,
      offset: getOffset(params),
      order: [['created_at', 'DESC']],
    });
  }

  async findById(id: string) {
    return Product.findByPk(id, { include: this.defaultInclude });
  }

  async findByCode(code: string) {
    return Product.findOne({
      where: { code, isActive: true },
      include: this.defaultInclude,
    });
  }

  async create(data: Partial<Product>) {
    return Product.create(data as any);
  }

  async update(id: string, data: Partial<Product>) {
    const product = await Product.findByPk(id);
    if (!product) return null;
    return product.update(data);
  }

  async softDelete(id: string) {
    const product = await Product.findByPk(id);
    if (!product) return null;
    return product.update({ isActive: false });
  }
}
