import { Sale } from './sale.model.js';
import { SaleDetail } from './sale-detail.model.js';
import { Product } from '../product/product.model.js';
import { User } from '../user/user.model.js';
import { Client } from '../client/client.model.js';
import { PaymentMethod } from '../catalog/models/payment-method.model.js';
import { sequelize } from '../../config/database.js';
import { NotFoundError } from '../../common/errors/not-found.error.js';
import { AppError } from '../../common/errors/app-error.js';
import { buildPaginationMeta, getOffset, type PaginationParams } from '../../common/helpers/pagination.js';

interface CreateSaleInput {
  clientId?: string | null;
  voucherType: 'RECEIPT' | 'INVOICE' | 'TICKET';
  voucherCode: string;
  saleChannel: 'IN_STORE' | 'ONLINE';
  paymentMethodId: number;
  products: Array<{ productId: string; quantity: number }>;
}

/**
 * SaleService — handles sale creation with stock management.
 *
 * Key business rules:
 * - Creating a sale DECREASES product stock
 * - Stock cannot go negative (validated at DB level with CHECK)
 * - Unit price is taken from the product's current sale_price
 * - Total is calculated from all detail subtotals
 * - Sale is linked to the active cash register (if open)
 */
export class SaleService {
  async create(sellerId: string, cashRegisterId: number | null, data: CreateSaleInput) {
    const result = await sequelize.transaction(async (t) => {
      // Create sale header (total = 0 initially, updated after details)
      const sale = await Sale.create({
        clientId: data.clientId || null,
        sellerId,
        cashRegisterId,
        voucherType: data.voucherType,
        voucherCode: data.voucherCode,
        saleChannel: data.saleChannel,
        paymentMethodId: data.paymentMethodId,
        total: 0,
      } as any, { transaction: t });

      // Create details, validate stock, decrease it
      let totalCalculated = 0;

      const details = await Promise.all(
        data.products.map(async (item) => {
          const product = await Product.findByPk(item.productId, { transaction: t });
          if (!product) throw new NotFoundError(`Producto ${item.productId}`);

          if (product.stock < item.quantity) {
            throw new AppError(
              400,
              'INSUFFICIENT_STOCK',
              `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, solicitado: ${item.quantity}`,
            );
          }

          // Create detail with current sale price
          const detail = await SaleDetail.create({
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product.salePrice,
          } as any, { transaction: t });

          // Decrease stock
          await product.update({ stock: product.stock - item.quantity }, { transaction: t });

          totalCalculated += item.quantity * Number(product.salePrice);
          return detail;
        }),
      );

      // Update total
      await sale.update({ total: totalCalculated }, { transaction: t });

      return { sale: { ...sale.toJSON(), total: totalCalculated }, details: details.map((d) => d.toJSON()) };
    });

    return result;
  }

  async getAll(params: PaginationParams) {
    const { rows, count } = await Sale.findAndCountAll({
      include: [
        { model: User, as: 'seller', attributes: ['id', 'firstName', 'lastName'] },
        { model: Client, as: 'client', attributes: ['id', 'firstName', 'lastName'] },
        { model: PaymentMethod, as: 'paymentMethod', attributes: ['id', 'name', 'displayName'] },
        { model: SaleDetail, as: 'details' },
      ],
      limit: params.limit,
      offset: getOffset(params),
      order: [['sold_at', 'DESC']],
    });
    return { data: rows, meta: buildPaginationMeta(count, params) };
  }

  async getById(id: number) {
    const sale = await Sale.findByPk(id, {
      include: [
        { model: User, as: 'seller', attributes: ['id', 'firstName', 'lastName'] },
        { model: Client, as: 'client', attributes: ['id', 'firstName', 'lastName'] },
        { model: PaymentMethod, as: 'paymentMethod', attributes: ['id', 'name', 'displayName'] },
        { model: SaleDetail, as: 'details', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'code'] }] },
      ],
    });
    if (!sale) throw new NotFoundError('Venta');
    return sale;
  }
}
