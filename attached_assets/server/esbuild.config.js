import { build } from "esbuild";
import dotenv from "dotenv";
import { nodeExternalsPlugin } from "esbuild-node-externals";
dotenv.config();
build({ entryPoints: ["src/index.ts"], bundle: true, platform: "node", target: "node20", format: "cjs", outfile: "dist/index.js", sourcemap: true, plugins: [nodeExternalsPlugin()] }).catch(() => process.exit(1));