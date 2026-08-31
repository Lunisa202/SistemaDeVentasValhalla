import request from 'supertest';
import { app } from '../../app';

/**
 * Shared helpers for integration tests.
 *
 * These tests hit the REAL app + a REAL PostgreSQL database. They require:
 *   1. The test DB running (e.g. `docker compose up db`)
 *   2. Migrations + seeders applied (the bootstrap does this, or run
 *      `pnpm run migrate && pnpm run seed`)
 *   3. The default admin user seeded (admin@valhalla.com / Admin123!)
 *
 * Run only these tests with: `pnpm run test:integration`
 */

const API = '/api/v1';

export const adminCredentials = {
  email: 'admin@valhalla.com',
  password: 'Admin123!',
};

/** Log in as admin and return the access token. */
export async function loginAsAdmin(): Promise<string> {
  const res = await request(app).post(`${API}/auth/login`).send(adminCredentials);
  if (res.status !== 200) {
    throw new Error(
      `Login failed (${res.status}). Is the DB up and seeded? Body: ${JSON.stringify(res.body)}`,
    );
  }
  return res.body.data.accessToken as string;
}

/** Authorization header helper. */
export function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export { app, API };
