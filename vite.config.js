import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
  },
  server: {
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
      },
    },
  },
});
