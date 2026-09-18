const { app, BrowserWindow, ipcMain, shell } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");
app.setName("Noryum");
app.setAppUserModelId("com.noryum.desktop");
// Keep the existing data directory so the rebrand preserves every saved workspace.
app.setPath(
  "userData",
  process.env.NORYUM_DATA_DIR ||
    process.env.CAREER_DATA_DIR ||
    path.join(app.getPath("appData"), "career-roadmap"),
);
let queue = Promise.resolve();
let quitting = false;
if (!app.requestSingleInstanceLock()) app.quit();
app.on("before-quit", (event) => {
  if (!quitting) {
    event.preventDefault();
    queue.finally(() => {
      quitting = true;
      app.quit();
    });
  }
});
app.whenReady().then(() => {
  const file = path.join(app.getPath("userData"), "roadmap.json");
  ipcMain.handle("load", async () => {
    try {
      return await fs.readFile(file, "utf8");
    } catch (e) {
      if (e.code === "ENOENT") return null;
      throw e;
    }
  });
  ipcMain.handle("save", (_event, text) => {
    if (typeof text !== "string" || text.length > 5e6)
      throw Error("Invalid data");
    JSON.parse(text);
    queue = queue
      .catch(() => {})
      .then(async () => {
        await fs.mkdir(path.dirname(file), { recursive: true });
        await fs.writeFile(file + ".tmp", text);
        await fs.rename(file + ".tmp", file);
      });
    return queue;
  });
  const win = new BrowserWindow({
    title: "Noryum",
    icon: path.join(__dirname, "../dist/icon.ico"),
    width: 1510,
    height: 980,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: "#0d141e",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  app.on("second-instance", () => {
    if (win.isMinimized()) win.restore();
    win.focus();
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (event) => event.preventDefault());
  win.loadFile(path.join(__dirname, "../dist/index.html"));
});
app.on("window-all-closed", () => app.quit());
