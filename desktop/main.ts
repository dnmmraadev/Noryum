import { app, BrowserWindow, ipcMain, dialog, session } from 'electron';
import { join } from 'node:path';
import { mkdirSync, appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { NoryumStore } from '../src/data/store';
let store: NoryumStore;
let mainWindow: BrowserWindow;
if(process.env.NORYUM_DATA_DIR) app.setPath('userData',process.env.NORYUM_DATA_DIR);
const dataDir=app.getPath('userData');
mkdirSync(dataDir,{recursive:true});
function log(event:string,error:unknown) {
  // Log operational error messages only; never include request payloads or personal notes.
  appendFileSync(join(dataDir,'noryum.log'),JSON.stringify({time:new Date().toISOString(),event,error:error instanceof Error?error.message:'Unknown error'})+'\n');
}
const devUrl=!app.isPackaged?process.env.NORYUM_DEV_URL:undefined;
const localUrl=pathToFileURL(join(__dirname,'../dist/index.html')).href;
function verify(event: Electron.IpcMainInvokeEvent) {
 if(event.sender!==mainWindow.webContents || event.senderFrame!==mainWindow.webContents.mainFrame || event.senderFrame.url!==(devUrl??localUrl)) throw new Error('Origen no autorizado.');
}
if(!app.requestSingleInstanceLock()) app.quit();
else {
app.on('second-instance',()=>{if(mainWindow){if(mainWindow.isMinimized())mainWindow.restore();mainWindow.focus();}});
app.whenReady().then(()=>{
 store=new NoryumStore(join(dataDir,'noryum.sqlite'));
 session.defaultSession.setPermissionRequestHandler((_contents,_permission,callback)=>callback(false));
 session.defaultSession.setPermissionCheckHandler(()=>false);
 session.defaultSession.webRequest.onBeforeRequest((details,callback)=>{
   const allowed=details.url.startsWith('file://') || Boolean(devUrl && (details.url.startsWith(devUrl)||details.url.startsWith(devUrl.replace('http:','ws:'))));
   callback({cancel:!allowed});
 });
 mainWindow=new BrowserWindow({width:1480,height:1020,minWidth:1050,minHeight:720,title:'Noryum',icon:join(__dirname,'../dist/icon.png'),backgroundColor:'#eef3f8',autoHideMenuBar:true,show:false,webPreferences:{preload:join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true}});
 mainWindow.removeMenu();
 mainWindow.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 mainWindow.webContents.on('will-navigate',(event,url)=>{if(url!==(devUrl??localUrl))event.preventDefault();});
 ipcMain.handle('noryum:snapshot',(event,date)=>{verify(event);return store.snapshot(date);});
 ipcMain.handle('noryum:action',(event,action,payload)=>{verify(event);try{return store.invoke(action,payload);}catch(error){log('action_failed',error);throw error;}});
 ipcMain.handle('noryum:backup',async(event)=>{
   verify(event);
   const result=await dialog.showSaveDialog(mainWindow,{title:'Guardar copia de seguridad',defaultPath:`Noryum-${new Date().toISOString().slice(0,10)}.sqlite`,filters:[{name:'Copia SQLite',extensions:['sqlite']}]});
   if(result.canceled||!result.filePath)return null;
   await store.backup(result.filePath);return result.filePath;
 });
 mainWindow.once('ready-to-show',()=>mainWindow.show());
 mainWindow.loadURL(devUrl??localUrl);
}).catch(error=>{log('startup_failed',error);dialog.showErrorBox('No se pudo iniciar Noryum',String(error));app.quit();});
app.on('window-all-closed',()=>app.quit());
app.on('will-quit',()=>store?.close());
}

