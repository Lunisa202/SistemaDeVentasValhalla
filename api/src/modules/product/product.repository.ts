import { Product } from './product.model';
import { ProductCategory } from '../catalog/models/product-category.model';
import { getOffset, type PaginationParams } from '../../common/helpers/pagination';
import { Op } from 'sequelize';
import type { CreateProductDto, UpdateProductDto } from './product.dto';

export class ProductRepository {
  private readonly defaultInclude = [
    { model: ProductCategory, as: 'category', attributes: ['id', 'name', 'description'] },
  ];

  async findAll(
    params: PaginationParams,
    filters?: { isActive?: boolean; categoryId?: number; search?: string },
  ) {
    const conditions: any[] = [];

    if (filters?.isActive !== undefined) conditions.push({ isActive: filters.isActive });
    if (filters?.categoryId) conditions.push({ categoryId: filters.categoryId });
    if (filters?.search) {
      conditions.push({
        [Op.or]: [
          { name: { [Op.iLike]: `%${filters.search}%` } },
          { code: { [Op.iLike]: `%${filters.search}%` } },
        ],
      });
    }

    const where = conditions.length > 0 ? { [Op.and]: conditions } : {};

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

  async create(data: CreateProductDto) {
    return Product.create(data as any);
  }

  async update(id: string, data: UpdateProductDto) {
    const product = await Product.findByPk(id);
    if (!product) return null;
    return product.update(data as any);
  }

  async softDelete(id: string) {
    const product = await Product.findByPk(id);
    if (!product) return null;
    return product.update({ isActive: false });
  }
}
