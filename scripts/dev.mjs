import { spawn } from 'node:child_process';
import { createServer } from 'vite';
await import('./build.mjs');
const server=await createServer({configLoader:'native'}); await server.listen();
const {default:electron}=await import('electron');
const child=spawn(electron,['.'],{stdio:'inherit',env:{...process.env,NORYUM_DEV_URL:server.resolvedUrls.local[0]}});
child.on('exit',async(code)=>{await server.close();process.exit(code??0)});
