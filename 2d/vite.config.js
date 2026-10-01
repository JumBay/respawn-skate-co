import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Jeu 2D : un module ES unique, dist/respawn-2d.js, à côté du bundle 3D (dist/ n'est pas vidé).
// Dev : npm run dev:2d -> http://localhost:5198 (2d/index.html).
export default defineConfig({
  root: resolve(import.meta.dirname),
  base: './',
  server: { port: 5198, strictPort: true, fs: { allow: [resolve(import.meta.dirname, '..')] } },
  build: {
    target: 'es2020',
    outDir: resolve(import.meta.dirname, '../dist'),
    emptyOutDir: false,
    copyPublicDir: false,
    lib: { entry: resolve(import.meta.dirname, 'src/main.js'), formats: ['es'], fileName: () => 'respawn-2d.js' },
    rollupOptions: { output: { inlineDynamicImports: true } },
    minify: true,
    sourcemap: false,
  },
});
