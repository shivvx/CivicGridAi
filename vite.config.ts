import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Strict Loopback Isolation: Binds only to 127.0.0.1 on port 8750
// Complete protection on shared Wi-Fi
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '127.0.0.1',
    port: 8750,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8749',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 8750,
    strictPort: true,
  },
});
