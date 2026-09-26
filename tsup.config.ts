import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/io/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  clean: true,
  outDir: 'dist',
  platform: 'node',
  target: 'node18',
  shims: true,
  external: [],
  noExternal: [],
  treeshake: true,
  minify: false,
  sourcemap: true,
})