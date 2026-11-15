import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}'],
          setupFiles: ['src/test/setup.ts'],
        },
      },
      {
        // Dev tool, not run in CI: npm run render:figures
        extends: true,
        test: {
          name: 'render',
          environment: 'node',
          include: ['tools/**/*.test.tsx'],
        },
      },
      {
        test: {
          name: 'rules',
          environment: 'node',
          include: ['tests/rules/**/*.test.ts'],
        },
      },
    ],
  },
})
