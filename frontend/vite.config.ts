import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path-browserify'; 
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // `@` を `src` にマッピング
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // FastAPI が動作するアドレス
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
});
