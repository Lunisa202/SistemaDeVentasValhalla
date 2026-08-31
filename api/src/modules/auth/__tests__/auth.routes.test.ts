import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app, API, adminCredentials } from '../../../__tests__/helpers/setup';
import { sequelize } from '../../../config/database';

/**
 * Integration tests for the auth endpoints.
 * Requires a running, seeded test database (see setup.ts).
 */
describe('Auth API (integration)', () => {
  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /auth/login', () => {
    it('devuelve access token con credenciales válidas', async () => {
      const res = await request(app).post(`${API}/auth/login`).send(adminCredentials).expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.role).toBe('admin');
    });

    it('establece el refresh token en una cookie httpOnly', async () => {
      const res = await request(app).post(`${API}/auth/login`).send(adminCredentials).expect(200);

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(String(cookies)).toContain('refreshToken');
      expect(String(cookies)).toContain('HttpOnly');
    });

    it('devuelve 401 con contraseña incorrecta', async () => {
      const res = await request(app)
        .post(`${API}/auth/login`)
        .send({ email: adminCredentials.email, password: 'wrong-password' })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('devuelve 401 con email inexistente', async () => {
      await request(app)
        .post(`${API}/auth/login`)
        .send({ email: 'nadie@valhalla.com', password: 'x' })
        .expect(401);
    });

    it('devuelve error de validación con email inválido', async () => {
      const res = await request(app)
        .post(`${API}/auth/login`)
        .send({ email: 'not-an-email', password: '123456' });

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /auth/refresh', () => {
    it('genera un nuevo access token usando la cookie de refresh', async () => {
      // 1. Login para obtener la cookie
      const loginRes = await request(app).post(`${API}/auth/login`).send(adminCredentials);
      const cookie = loginRes.headers['set-cookie'];

      // 2. Refresh con esa cookie
      const res = await request(app).post(`${API}/auth/refresh`).set('Cookie', cookie).expect(200);

      expect(res.body.data.accessToken).toBeDefined();
    });

    it('devuelve 401 sin cookie de refresh', async () => {
      await request(app).post(`${API}/auth/refresh`).expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('cierra sesión correctamente', async () => {
      const loginRes = await request(app).post(`${API}/auth/login`).send(adminCredentials);
      const cookie = loginRes.headers['set-cookie'];

      const res = await request(app).post(`${API}/auth/logout`).set('Cookie', cookie).expect(200);
      expect(res.body.success).toBe(true);
    });
  });
});
