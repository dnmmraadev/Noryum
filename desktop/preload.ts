import { contextBridge, ipcRenderer } from 'electron';
import type { NoryumAPI } from '../src/domain/types';
const api: NoryumAPI = {
  snapshot: (date) => ipcRenderer.invoke('noryum:snapshot',date),
  invoke: (action,payload) => ipcRenderer.invoke('noryum:action',action,payload),
  backup: () => ipcRenderer.invoke('noryum:backup')
};
contextBridge.exposeInMainWorld('noryum',api);
