import { cp, mkdir, readFile, writeFile, rename, stat, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
const require=createRequire(import.meta.url);
const root=resolve(import.meta.dirname,'..');
require('electron'); // Ensure Electron's official runtime has been installed.
const electronRoot=dirname(require.resolve('electron/package.json'));
const target=join(root,'release','Noryum-win32-x64');
// Reusing this directory is safe: only known app files are overwritten, no user data lives here.
await mkdir(target,{recursive:true});
await cp(join(electronRoot,'dist'),target,{recursive:true,force:true});
await rename(join(target,'electron.exe'),join(target,'Noryum.exe'));
const resources=join(target,'resources'),appDir=join(resources,'app');
await mkdir(appDir,{recursive:true});
await cp(join(root,'dist'),join(appDir,'dist'),{recursive:true,force:true});
await cp(join(root,'dist-desktop'),join(appDir,'dist-desktop'),{recursive:true,force:true});
const pkg=JSON.parse(await readFile(join(root,'package.json'),'utf8'));
await writeFile(join(appDir,'package.json'),JSON.stringify({name:pkg.name,productName:'Noryum',version:pkg.version,main:pkg.main,description:pkg.description},null,2));
await cp(join(root,'README.md'),join(target,'LEEME.md'));
await writeFile(join(target,'INICIAR.txt'),'Abre Noryum.exe. No necesitas instalar Node, crear una cuenta ni conectarte a Internet.\r\nConserva todos los archivos de esta carpeta juntos.\r\nLos datos se guardan en %APPDATA%/noryum; consulta LEEME.md para respaldos.\r\n');
const info=await stat(join(target,'Noryum.exe'));console.log(`Windows x64 preparado: ${target} (${info.size} bytes de ejecutable)`);
