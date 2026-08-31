// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

/**
 * ESLint flat config (ESLint v9 + typescript-eslint v8).
 *
 * Philosophy: catch real bugs, not fight the framework.
 *
 * We use the `recommended` preset (syntactic rules, no type-checking) rather
 * than `recommendedTypeChecked`. The type-checked preset flags many false
 * positives in Express + Sequelize code, where `req.body` is `any` (validated
 * by Zod at runtime) and Sequelize's `.create()` needs `as any` casts. Those
 * are deliberate patterns, not bugs — TypeScript's own `strict` mode already
 * guards type safety at compile time.
 *
 * `prettierConfig` is last so Prettier owns all formatting decisions.
 */
export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'eslint.config.js'],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended (syntactic, no type-info needed)
  ...tseslint.configs.recommended,

  {
    rules: {
      // Allow intentional `any` (Sequelize `as any`, Express req.body)
      '@typescript-eslint/no-explicit-any': 'off',
      // Unused vars: error, but allow underscore-prefixed (e.g. _req, _next)
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Allow non-null assertions (req.user!) — guaranteed after authGuard
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Namespaces are needed to augment the Express Request interface
      '@typescript-eslint/no-namespace': 'off',
    },
  },

  // Prettier compatibility — MUST be last
  prettierConfig,
);
