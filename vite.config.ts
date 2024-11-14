import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base:  '/ledcalc/'
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: '0.0.0.0',
    hmr: {
      protocol: 'ws',
      host: '0.0.0.0',
      port: 5173
    }
  },
  preview: {
    port: 5173,
    strictPort: true,
    host: true
  }
});
