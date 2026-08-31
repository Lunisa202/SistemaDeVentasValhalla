import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, API, loginAsAdmin, auth } from '../../../__tests__/helpers/setup';
import { sequelize } from '../../../config/database';

/**
 * Integration tests for the Products CRUD.
 * Requires a running, seeded test database.
 */
describe('Products API (integration)', () => {
  let token: string;
  let productId: string;
  // Unique code per run (max 13 chars per schema). Last 8 digits of timestamp.
  const code = `T${Date.now().toString().slice(-8)}`;

  beforeAll(async () => {
    token = await loginAsAdmin();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('POST /products crea un producto', async () => {
    const res = await request(app)
      .post(`${API}/products`)
      .set(auth(token))
      .send({ name: 'Test Product', code, salePrice: 10, stock: 50, categoryId: 1 })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    productId = res.body.data.id;
  });

  it('POST /products rechaza código duplicado con 409', async () => {
    await request(app)
      .post(`${API}/products`)
      .set(auth(token))
      .send({ name: 'Dup', code, salePrice: 5, stock: 10, categoryId: 1 })
      .expect(409);
  });

  it('POST /products rechaza datos inválidos con error de validación', async () => {
    const res = await request(app)
      .post(`${API}/products`)
      .set(auth(token))
      .send({ name: '', code: '', salePrice: -5, categoryId: 1 });

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /products lista con paginación', async () => {
    const res = await request(app)
      .get(`${API}/products?page=1&limit=10`)
      .set(auth(token))
      .expect(200);

    expect(res.body.meta.total).toBeGreaterThan(0);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /products/code/:code encuentra por código de barras', async () => {
    const res = await request(app)
      .get(`${API}/products/code/${code}`)
      .set(auth(token))
      .expect(200);

    expect(res.body.data.name).toBe('Test Product');
  });

  it('GET /products/:id devuelve el producto', async () => {
    const res = await request(app).get(`${API}/products/${productId}`).set(auth(token)).expect(200);
    expect(res.body.data.id).toBe(productId);
  });

  it('PATCH /products/:id actualiza el producto', async () => {
    const res = await request(app)
      .patch(`${API}/products/${productId}`)
      .set(auth(token))
      .send({ salePrice: 12.5 })
      .expect(200);

    expect(Number(res.body.data.salePrice)).toBe(12.5);
  });

  it('GET /products sin token devuelve 401', async () => {
    await request(app).get(`${API}/products`).expect(401);
  });

  it('DELETE /products/:id hace soft delete', async () => {
    await request(app).delete(`${API}/products/${productId}`).set(auth(token)).expect(204);
  });
});
