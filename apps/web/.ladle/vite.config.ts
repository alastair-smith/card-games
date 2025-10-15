import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      'next/link': path.resolve(__dirname, './unoptimized-link.tsx'),
    },
  },
});
