import { Purchase } from './purchase.model';
import { PurchaseDetail } from './purchase-detail.model';
import { Product } from '../product/product.model';
import { User } from '../user/user.model';
import { Provider } from '../provider/provider.model';
import { sequelize } from '../../config/database';
import { NotFoundError } from '../../common/errors/not-found.error';
import { buildPaginationMeta, type PaginationParams } from '../../common/helpers/pagination';
import { getOffset } from '../../common/helpers/pagination';
import { roundTo2 } from '../../common/helpers/math';

interface CreatePurchaseInput {
  providerId: string;
  voucherType: 'RECEIPT' | 'INVOICE' | 'TICKET';
  products: Array<{ productId: string; quantity: number; unitPrice: number }>;
}

/**
 * PurchaseService — handles purchase creation with stock management.
 *
 * Key business rule: creating a purchase INCREASES product stock.
 * All operations within a purchase are wrapped in a transaction
 * (if one product fails, the entire purchase is rolled back).
 */
export class PurchaseService {
  async create(userId: string, data: CreatePurchaseInput) {
    const result = await sequelize.transaction(async (t) => {
      // Calculate total
      const total = roundTo2(data.products.reduce((acc, p) => acc + roundTo2(p.quantity * p.unitPrice), 0));

      // Create purchase header
      const purchase = await Purchase.create({
        userId,
        providerId: data.providerId,
        voucherType: data.voucherType,
        total,
      } as any, { transaction: t });

      // Create details and update stock
      const details = await Promise.all(
        data.products.map(async (item) => {
          // Create detail line
          const detail = await PurchaseDetail.create({
            purchaseId: purchase.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          } as any, { transaction: t });

          // Increase product stock
          const product = await Product.findByPk(item.productId, { transaction: t });
          if (!product) throw new NotFoundError(`Producto ${item.productId}`);
          await product.update({ stock: product.stock + item.quantity }, { transaction: t });

          return detail;
        }),
      );

      return { purchase: purchase.toJSON(), details: details.map((d) => d.toJSON()) };
    });

    return result;
  }

  async getAll(params: PaginationParams) {
    const { rows, count } = await Purchase.findAndCountAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Provider, as: 'provider', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: PurchaseDetail, as: 'details' },
      ],
      limit: params.limit,
      offset: getOffset(params),
      order: [['purchasedAt', 'DESC']],
    });
    return { data: rows, meta: buildPaginationMeta(count, params) };
  }

  async getById(id: number) {
    const purchase = await Purchase.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Provider, as: 'provider', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: PurchaseDetail, as: 'details', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'code'] }] },
      ],
    });
    if (!purchase) throw new NotFoundError('Compra');
    return purchase;
  }
}
