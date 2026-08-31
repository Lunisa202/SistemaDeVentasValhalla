import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, API, loginAsAdmin, auth } from '../../../__tests__/helpers/setup';
import { sequelize } from '../../../config/database';

/**
 * Integration test for the FULL SALE FLOW:
 *   open cash register → create product → sell → verify stock → close register.
 *
 * This exercises the integration of products, cash-register, and sales,
 * including the rule that a sale requires an open register, IGV calculation,
 * and stock decrement. Requires a running, seeded test database.
 */
describe('Sale flow (integration)', () => {
  let token: string;
  let productId: string;
  // Unique code per run (max 13 chars per schema).
  const code = `F${Date.now().toString().slice(-8)}`;

  beforeAll(async () => {
    token = await loginAsAdmin();

    // Ensure a clean slate: close any register left open by other runs.
    const status = await request(app).get(`${API}/cash-register/status`).set(auth(token));
    if (status.body?.data?.isOpen) {
      await request(app).post(`${API}/cash-register/close`).set(auth(token)).send({ actualAmount: 0 });
    }

    // Create a product to sell (stock 100)
    const prod = await request(app)
      .post(`${API}/products`)
      .set(auth(token))
      .send({ name: 'Flow Product', code, salePrice: 10, stock: 100, categoryId: 1 });
    productId = prod.body.data.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('rechaza vender sin caja abierta (409 NO_OPEN_CASH_REGISTER)', async () => {
    const res = await request(app)
      .post(`${API}/sales`)
      .set(auth(token))
      .send({
        voucherType: 'TICKET',
        voucherCode: `T-${Date.now()}`,
        saleChannel: 'IN_STORE',
        paymentMethodId: 1,
        discountAmount: 0,
        products: [{ productId, quantity: 1, discountPercent: 0 }],
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('NO_OPEN_CASH_REGISTER');
  });

  it('abre una caja', async () => {
    const res = await request(app)
      .post(`${API}/cash-register/open`)
      .set(auth(token))
      .send({ openingAmount: 100 })
      .expect(201);

    expect(res.body.data.status).toBe('OPEN');
  });

  it('rechaza abrir una segunda caja (409)', async () => {
    await request(app)
      .post(`${API}/cash-register/open`)
      .set(auth(token))
      .send({ openingAmount: 50 })
      .expect(409);
  });

  it('registra una venta con IGV calculado y descuenta stock', async () => {
    const res = await request(app)
      .post(`${API}/sales`)
      .set(auth(token))
      .send({
        voucherType: 'RECEIPT',
        voucherCode: `B-${Date.now()}`,
        saleChannel: 'IN_STORE',
        paymentMethodId: 1, // cash
        discountAmount: 0,
        products: [{ productId, quantity: 5, discountPercent: 0 }],
      })
      .expect(201);

    // 5 * 10 = 50 total (IGV incluido). taxBase = 50/1.18 = 42.37, taxAmount = 7.63
    expect(Number(res.body.data.sale.total)).toBe(50);
    expect(Number(res.body.data.sale.taxBase)).toBe(42.37);
    expect(Number(res.body.data.sale.taxAmount)).toBe(7.63);
  });

  it('el stock del producto disminuyó tras la venta', async () => {
    const res = await request(app).get(`${API}/products/${productId}`).set(auth(token)).expect(200);
    expect(Number(res.body.data.stock)).toBe(95); // 100 - 5
  });

  it('cierra la caja y genera resumen por método de pago', async () => {
    const res = await request(app)
      .post(`${API}/cash-register/close`)
      .set(auth(token))
      .send({ actualAmount: 150 }) // 100 apertura + 50 efectivo
      .expect(200);

    expect(res.body.data.status).toBe('CLOSED');
    // expected = 100 + 50 = 150 ; difference = 150 - 150 = 0
    expect(Number(res.body.data.expectedAmount)).toBe(150);
    expect(Number(res.body.data.difference)).toBe(0);
    // Hay al menos una fila de resumen (efectivo)
    expect(res.body.data.summaries.length).toBeGreaterThan(0);
  });

  it('tras cerrar, vuelve a rechazar ventas sin caja', async () => {
    await request(app)
      .post(`${API}/sales`)
      .set(auth(token))
      .send({
        voucherType: 'TICKET',
        voucherCode: `T2-${Date.now()}`,
        saleChannel: 'IN_STORE',
        paymentMethodId: 1,
        discountAmount: 0,
        products: [{ productId, quantity: 1, discountPercent: 0 }],
      })
      .expect(409);
  });
});
