import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Sortie : un module ES unique (dist/respawn.js) + les modèles copiés depuis public/.
export default defineConfig({
  base: './',
  server: { port: 5199, strictPort: true },
  build: {
    target: 'es2020',
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: false, // les ressources restent dans public/ (servies telles quelles par jsDelivr)
    lib: {
      entry: resolve(import.meta.dirname, 'src/main.js'),
      formats: ['es'],
      fileName: () => 'respawn.js',
    },
    rollupOptions: { output: { inlineDynamicImports: true } },
    minify: true,
    sourcemap: false,
  },
});
