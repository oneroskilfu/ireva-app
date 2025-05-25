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
  external: ['../vite.config'],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
}).catch(() => process.exit(1));