import { Sale } from './sale.model';
import { SaleDetail } from './sale-detail.model';
import { Product } from '../product/product.model';
import { User } from '../user/user.model';
import { Client } from '../client/client.model';
import { PaymentMethod } from '../catalog/models/payment-method.model';
import { sequelize } from '../../config/database';
import { NotFoundError } from '../../common/errors/not-found.error';
import { AppError } from '../../common/errors/app-error';
import { buildPaginationMeta, getOffset, type PaginationParams } from '../../common/helpers/pagination';
import { roundTo2 } from '../../common/helpers/math';

/** IGV rate in Peru (18%) */
const IGV_RATE = 0.18;

interface CreateSaleInput {
  clientId?: string | null;
  voucherType: 'RECEIPT' | 'INVOICE' | 'TICKET';
  voucherCode: string;
  saleChannel: 'IN_STORE' | 'ONLINE';
  paymentMethodId: number;
  discountAmount: number;
  products: Array<{ productId: string; quantity: number; discountPercent: number }>;
}

/**
 * SaleService — handles sale creation with stock management and IGV calculation.
 *
 * Key business rules:
 * - Creating a sale DECREASES product stock
 * - Stock cannot go negative (validated at DB level with CHECK)
 * - Unit price is taken from the product's current sale_price (includes IGV)
 * - Per-item discount applied as percentage
 * - Global discount applied as fixed amount
 * - IGV decomposed from total (prices already include IGV in Peru)
 *   Formula: taxBase = total / 1.18, taxAmount = total - taxBase
 */
export class SaleService {
  async create(sellerId: string, cashRegisterId: number | null, data: CreateSaleInput) {
    const result = await sequelize.transaction(async (t) => {
      // Create sale header (totals calculated after details)
      const sale = await Sale.create({
        clientId: data.clientId || null,
        sellerId,
        cashRegisterId,
        voucherType: data.voucherType,
        voucherCode: data.voucherCode,
        saleChannel: data.saleChannel,
        paymentMethodId: data.paymentMethodId,
        subtotal: 0,
        discountAmount: data.discountAmount,
        taxBase: 0,
        taxAmount: 0,
        total: 0,
      } as any, { transaction: t });

      // Create details, validate stock, decrease it
      let itemsSubtotal = 0;

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

          // Create detail with current sale price and discount
          const detail = await SaleDetail.create({
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product.salePrice,
            discountPercent: item.discountPercent,
          } as any, { transaction: t });

          // Decrease stock
          await product.update({ stock: product.stock - item.quantity }, { transaction: t });

          // Calculate line subtotal (with discount)
          const lineSubtotal = roundTo2(item.quantity * Number(product.salePrice) * (1 - item.discountPercent / 100));
          itemsSubtotal = roundTo2(itemsSubtotal + lineSubtotal);

          return detail;
        }),
      );

      // Calculate totals with IGV decomposition
      const totalAfterDiscount = roundTo2(itemsSubtotal - data.discountAmount);
      const taxBase = roundTo2(totalAfterDiscount / (1 + IGV_RATE));
      const taxAmount = roundTo2(totalAfterDiscount - taxBase);

      await sale.update({
        subtotal: itemsSubtotal,
        taxBase,
        taxAmount,
        total: totalAfterDiscount,
      }, { transaction: t });

      return {
        sale: {
          ...sale.toJSON(),
          subtotal: itemsSubtotal,
          discountAmount: data.discountAmount,
          taxBase,
          taxAmount,
          total: totalAfterDiscount,
        },
        details: details.map((d) => d.toJSON()),
      };
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
      order: [['soldAt', 'DESC']],
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
