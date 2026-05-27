import { BrowserWindow, app } from "electron";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { autoUpdater } = require("electron-updater");
import path from "path";
import { fileURLToPath } from "url";

const mainDir = path.dirname(fileURLToPath(import.meta.url));
let updateWindow: BrowserWindow | null = null;

export function checkForUpdates(onNoUpdate: () => void) {
  // 개발 모드에서는 업데이트 체크 스킵
  if (!app.isPackaged) {
    onNoUpdate();
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () => {
    // 조용히 체크
  });

  autoUpdater.on("update-available", (info) => {
    // 업데이트 발견 → 로딩 창 표시
    showUpdateWindow();
    sendStatus(`새 버전 ${info.version} 다운로드 중...`);
  });

  autoUpdater.on("update-not-available", () => {
    onNoUpdate();
  });

  autoUpdater.on("download-progress", (progress) => {
    sendProgress(progress.percent);
    sendStatus(`다운로드 중... (${formatBytes(progress.transferred)} / ${formatBytes(progress.total)})`);
  });

  autoUpdater.on("update-downloaded", () => {
    sendStatus("설치 중... 잠시만 기다려주세요");
    sendProgress(100);
    setTimeout(() => {
      autoUpdater.quitAndInstall(false, true);
    }, 1500);
  });

  autoUpdater.on("error", (err) => {
    console.error("Update error:", err);
    closeUpdateWindow();
    onNoUpdate();
  });

  autoUpdater.checkForUpdates();
}

function showUpdateWindow() {
  updateWindow = new BrowserWindow({
    width: 320,
    height: 180,
    resizable: false,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    center: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(mainDir, "preload.js"),
    },
  });

  const updateHtml = path.join(mainDir, "..", "renderer", "update.html");
  updateWindow.loadFile(updateHtml);
}

function closeUpdateWindow() {
  if (updateWindow) {
    updateWindow.close();
    updateWindow = null;
  }
}

function sendStatus(msg: string) {
  updateWindow?.webContents.send("update-status", msg);
}

function sendProgress(percent: number) {
  updateWindow?.webContents.send("update-progress", percent);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}
