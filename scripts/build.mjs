import { build } from 'esbuild';
await build({entryPoints:['desktop/main.ts','desktop/preload.ts'],outdir:'dist-desktop',bundle:true,platform:'node',format:'cjs',outExtension:{'.js':'.cjs'},external:['electron','node:sqlite'],target:'node24',sourcemap:true});
