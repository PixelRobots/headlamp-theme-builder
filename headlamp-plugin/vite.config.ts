import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@builder': path.resolve(__dirname, '../src'),
    },
  },
});
