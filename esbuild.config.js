// esbuild.config.js
import { build } from 'esbuild';
import dotenv from 'dotenv';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

dotenv.config();

build({
  entryPoints: ['server/index.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  sourcemap: true,
  plugins: [nodeExternalsPlugin()],
  external: [
    '../vite.config',
    '../vite.config.ts',
    '../vite.config.js',
    'vite'
  ],
  loader: {
    '.ts': 'ts',
    '.js': 'js'
  },
  resolveExtensions: ['.ts', '.js', '.mjs'],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  logLevel: 'error',
  minify: false,
  treeShaking: true
}).catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});