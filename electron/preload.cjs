const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("desktop", {
  load: () => ipcRenderer.invoke("load"),
  save: (text) => ipcRenderer.invoke("save", text),
});
