import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { registerIpcHandlers } from "./ipc";
import { closeDb } from "./db/connection";

// Bun bundler가 __dirname을 소스 경로로 하드코딩하는 문제 회피
const mainDir = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    title: "오늘시간표",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(mainDir, "preload.js"),
    },
  });

  const rendererPath = path.join(mainDir, "..", "renderer", "index.html");
  mainWindow.loadFile(rendererPath);

  mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  closeDb();
  if (process.platform !== "darwin") app.quit();
});
