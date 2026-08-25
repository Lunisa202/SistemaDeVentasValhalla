import { Role } from './models/role.model';
import { DocumentType } from './models/document-type.model';
import { PaymentMethod } from './models/payment-method.model';
import { ProductCategory } from './models/product-category.model';

/**
 * CatalogService — read-only access to reference tables.
 *
 * These tables (roles, document types, payment methods, categories)
 * are seeded at deployment and rarely change. The frontend fetches
 * them once to populate dropdowns and filters.
 *
 * Pattern: Service Layer — encapsulates data access logic.
 * No repository needed here because queries are trivial (findAll).
 */
export class CatalogService {
  async getRoles() {
    return Role.findAll({ order: [['id', 'ASC']] });
  }

  async getDocumentTypes() {
    return DocumentType.findAll({ order: [['id', 'ASC']] });
  }

  async getPaymentMethods() {
    return PaymentMethod.findAll({ order: [['id', 'ASC']] });
  }

  async getProductCategories() {
    return ProductCategory.findAll({ order: [['id', 'ASC']] });
  }

  async createProductCategory(data: { name: string; description?: string }) {
    return ProductCategory.create(data);
  }

  async updateProductCategory(id: number, data: { name?: string; description?: string }) {
    const category = await ProductCategory.findByPk(id);
    if (!category) return null;
    return category.update(data);
  }

  async deleteProductCategory(id: number) {
    const category = await ProductCategory.findByPk(id);
    if (!category) return null;
    await category.destroy();
    return true;
  }
}
