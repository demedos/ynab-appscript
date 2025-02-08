import { includeIgnoreFile } from '@eslint/compat';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

export default [
  includeIgnoreFile(gitignorePath),
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
  },
  {
    ignores: ['*.config.js'],
  },
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['**/*.test.ts', 'jest.setup.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
