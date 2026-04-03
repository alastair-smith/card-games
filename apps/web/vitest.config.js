import path from 'node:path';
import react from '@vitejs/plugin-react';

export default {
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    exclude: [
      '**/*.integration.test.ts',
      'node_modules/**',
      '.next/**',
      'e2e/**',
    ],
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
};
