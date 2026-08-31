import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Unit tests for SaleService.
 *
 * SaleService uses models + sequelize.transaction directly (no injectable
 * repository), so we mock those modules. The goal is to verify the business
 * logic: stock validation, IGV decomposition, and discount math.
 *
 * The transaction mock simply runs the callback with a fake tx object.
 */

// --- Mocks (must be declared before importing the service) ---
const mockSaleInstance = {
  id: 100,
  update: vi.fn().mockResolvedValue(undefined),
  toJSON: vi.fn(() => ({ id: 100 })),
};

vi.mock('../../../config/database', () => ({
  sequelize: {
    transaction: vi.fn(async (cb: (t: unknown) => Promise<unknown>) => cb({})),
  },
}));

vi.mock('../sale.model', () => ({
  Sale: { create: vi.fn(() => mockSaleInstance) },
}));

const saleDetailCreate = vi.fn((data: unknown) => ({ ...(data as object), toJSON: () => data }));
vi.mock('../sale-detail.model', () => ({
  SaleDetail: { create: (d: unknown) => saleDetailCreate(d) },
}));

const productFindByPk = vi.fn();
vi.mock('../../product/product.model', () => ({
  Product: { findByPk: (...args: unknown[]) => productFindByPk(...args) },
}));

vi.mock('../../user/user.model', () => ({ User: {} }));
vi.mock('../../client/client.model', () => ({ Client: {} }));
vi.mock('../../catalog/models/payment-method.model', () => ({ PaymentMethod: {} }));

import { SaleService } from '../sale.service';
import { AppError } from '../../../common/errors/app-error';
import { NotFoundError } from '../../../common/errors/not-found.error';

/** Build a fake product with an update() that mutates stock. */
function fakeProduct(id: string, salePrice: number, stock: number) {
  return {
    id,
    name: `Product ${id}`,
    salePrice,
    stock,
    update: vi.fn(function (this: { stock: number }, data: { stock: number }) {
      this.stock = data.stock;
      return Promise.resolve(this);
    }),
  };
}

describe('SaleService.create', () => {
  let service: SaleService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSaleInstance.update.mockClear();
    service = new SaleService();
  });

  it('calcula el total, taxBase y taxAmount con IGV 18% (sin descuentos)', async () => {
    // 2 unidades a 10.00 = 20.00 total (IGV incluido)
    productFindByPk.mockResolvedValue(fakeProduct('p1', 10, 50));

    await service.create('seller-1', 5, {
      voucherType: 'RECEIPT',
      voucherCode: 'B001-1',
      saleChannel: 'IN_STORE',
      paymentMethodId: 1,
      discountAmount: 0,
      products: [{ productId: 'p1', quantity: 2, discountPercent: 0 }],
    });

    // El update final del header lleva los totales calculados
    const finalUpdate = mockSaleInstance.update.mock.calls.at(-1)?.[0];
    expect(finalUpdate.subtotal).toBe(20);
    expect(finalUpdate.total).toBe(20);
    // taxBase = 20 / 1.18 = 16.95 ; taxAmount = 3.05
    expect(finalUpdate.taxBase).toBe(16.95);
    expect(finalUpdate.taxAmount).toBe(3.05);
  });

  it('aplica descuento por item (10%)', async () => {
    productFindByPk.mockResolvedValue(fakeProduct('p1', 10, 50));

    await service.create('seller-1', 5, {
      voucherType: 'RECEIPT',
      voucherCode: 'B001-2',
      saleChannel: 'IN_STORE',
      paymentMethodId: 1,
      discountAmount: 0,
      products: [{ productId: 'p1', quantity: 2, discountPercent: 10 }],
    });

    // 2 * 10 * (1 - 0.10) = 18.00
    const finalUpdate = mockSaleInstance.update.mock.calls.at(-1)?.[0];
    expect(finalUpdate.subtotal).toBe(18);
    expect(finalUpdate.total).toBe(18);
  });

  it('aplica descuento global (monto fijo)', async () => {
    productFindByPk.mockResolvedValue(fakeProduct('p1', 10, 50));

    await service.create('seller-1', 5, {
      voucherType: 'TICKET',
      voucherCode: 'T001-1',
      saleChannel: 'IN_STORE',
      paymentMethodId: 1,
      discountAmount: 5,
      products: [{ productId: 'p1', quantity: 2, discountPercent: 0 }],
    });

    // subtotal 20 - 5 (global) = 15 total
    const finalUpdate = mockSaleInstance.update.mock.calls.at(-1)?.[0];
    expect(finalUpdate.subtotal).toBe(20);
    expect(finalUpdate.total).toBe(15);
  });

  it('decrementa el stock del producto', async () => {
    const product = fakeProduct('p1', 10, 50);
    productFindByPk.mockResolvedValue(product);

    await service.create('seller-1', 5, {
      voucherType: 'RECEIPT',
      voucherCode: 'B001-3',
      saleChannel: 'IN_STORE',
      paymentMethodId: 1,
      discountAmount: 0,
      products: [{ productId: 'p1', quantity: 3, discountPercent: 0 }],
    });

    expect(product.update).toHaveBeenCalledWith(
      expect.objectContaining({ stock: 47 }),
      expect.anything(),
    );
  });

  it('lanza INSUFFICIENT_STOCK si no hay stock suficiente', async () => {
    productFindByPk.mockResolvedValue(fakeProduct('p1', 10, 2));

    await expect(
      service.create('seller-1', 5, {
        voucherType: 'RECEIPT',
        voucherCode: 'B001-4',
        saleChannel: 'IN_STORE',
        paymentMethodId: 1,
        discountAmount: 0,
        products: [{ productId: 'p1', quantity: 10, discountPercent: 0 }],
      }),
    ).rejects.toThrow(AppError);
  });

  it('lanza NotFoundError si el producto no existe', async () => {
    productFindByPk.mockResolvedValue(null);

    await expect(
      service.create('seller-1', 5, {
        voucherType: 'RECEIPT',
        voucherCode: 'B001-5',
        saleChannel: 'IN_STORE',
        paymentMethodId: 1,
        discountAmount: 0,
        products: [{ productId: 'nope', quantity: 1, discountPercent: 0 }],
      }),
    ).rejects.toThrow(NotFoundError);
  });
});
