import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration.
 *
 * - `globals: true` — use describe/it/expect without importing them.
 * - `environment: node` — we test backend code, no DOM needed.
 * - Coverage focuses on the layers worth testing (services, helpers,
 *   middlewares); models and barrel files are excluded (see docs/testing.md).
 * - Integration tests (*.routes.test.ts) hit a real test DB, so they run
 *   with a longer timeout.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    testTimeout: 15000,
    // Ensure NODE_ENV=test so rate limiters are skipped and behavior matches tests
    env: { NODE_ENV: 'test' },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.model.ts',
        'src/**/index.ts',
        'src/**/*.routes.ts',
        'src/**/*.schema.ts',
        'src/**/*.dto.ts',
        'src/config/**',
        'src/database/**',
        'src/index.ts',
        'src/app.ts',
      ],
    },
  },
});
