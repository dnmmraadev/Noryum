import { registerHooks } from 'node:module';
import { readdir } from 'node:fs/promises';
// Node 24 strips TypeScript natively. Resolve extensionless relative TS imports
// without a subprocess, also supporting constrained Windows shells.
registerHooks({resolve(specifier,context,next){
 try{return next(specifier,context);}catch(error){
  if(error.code==='ERR_MODULE_NOT_FOUND'&&specifier.startsWith('.'))return next(specifier+'.ts',context);
  throw error;
 }
}});
for(const file of await readdir(new URL('../tests/',import.meta.url))){
 if(file.endsWith('.test.ts'))await import(new URL('../tests/'+file,import.meta.url));
}
