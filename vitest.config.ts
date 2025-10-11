import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['workspaces/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.git'],
    passWithNoTests: true,
  },
});
