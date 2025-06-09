import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  cacheDir: 'node_modules/.vite-new',

  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
