import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    root: '.',
    publicDir: false,
    server: {
        port: 5174,
        open: true
    },
    resolve: {
        alias: {
            $: fileURLToPath(new URL('./src/gm-mock.ts', import.meta.url))
        }
    },
    build: {
        outDir: 'dist/preview',
        emptyOutDir: true
    }
});
