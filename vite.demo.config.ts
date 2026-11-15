import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
const baseline=process.env.DEMO_BASELINE==='true';
export default defineConfig({
  plugins:[{name:'original-numeric-field',enforce:'pre',resolveId(source,importer){if(baseline && source==='./ui/NumericField' && importer?.endsWith('/src/components/RunConfig.tsx'))return path.resolve('demo/NumericField.before.tsx');}},react(),tailwindcss()],
  define:{'import.meta.env.VITE_DEMO_BASELINE':JSON.stringify(baseline?'true':'false')},
  base:baseline?'/before/':'/after/',
  build:{outDir:baseline?'../visual-demo/dist/before':'../visual-demo/dist/after',emptyOutDir:true,rollupOptions:{input:'demo.html',output:{manualChunks(id){if(id.includes('node_modules'))return 'vendor';}}},sourcemap:true},
  server:{host:'127.0.0.1',port:baseline?3010:3011,strictPort:true},
});
