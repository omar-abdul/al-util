import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/cli.ts'],
    banner: { js: "#!/usr/bin/env node" },
    splitting: false,
    clean: true,
    format: 'esm'
})