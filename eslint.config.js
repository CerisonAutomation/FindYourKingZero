// =============================================================================
// eslint.config.js — ESLint 9 flat config
// ESLint 9 dropped support for .eslintrc.js — this is the correct format
// Only using packages that are confirmed in devDependencies
// =============================================================================
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      'external/**',
      '*.config.js',
      '*.config.ts',
      'coverage/**',
      'playwright-report/**',
    ],
  },

  // Base JS rules
  js.configs.recommended,

  // TypeScript rules
  ...tseslint.configs.recommended,

  // React hooks
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },

  // TypeScript-specific overrides
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // Allow explicit any in limited cases
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow unused vars with underscore prefix
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // Allow empty catch blocks with comment
      '@typescript-eslint/no-empty-function': 'off',
      // Relax some strict rules for enterprise codebase
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      // Allow require for config files
      '@typescript-eslint/no-require-imports': 'warn',
    },
  },

  // Prettier (must be last — disables conflicting rules)
  prettierConfig,
);
