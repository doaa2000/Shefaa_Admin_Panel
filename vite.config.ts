import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Its own port, not the dashboard's. The two were both 5173, and whichever
    // started second moved -- which broke the dashboard's password reset link
    // whenever the panel happened to start first.
    port: 5174,
    strictPort: true,
    host: true,
  },
});
