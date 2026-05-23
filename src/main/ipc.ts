import { ipcMain } from "electron";
import { getDb } from "./db/connection";
import { insertDemoData } from "./db/demo-data";
import { loadComciganData } from "./comcigan/loader";
import { login, logout, getCurrentUser } from "./firebase/auth";
import { IPC } from "../shared/constants";
import { TABLES } from "./db/schema";

export function registerIpcHandlers() {
  // Demo
  ipcMain.handle("demo:load", () => {
    try {
      const db = getDb();
      // 기존 데이터 삭제
      for (const table of TABLES) {
        db.prepare(`DELETE FROM ${table}`).run();
      }
      insertDemoData(db);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  // 컴시간 데이터 로드
  ipcMain.handle("comcigan:load", async (_event, schoolName: string) => {
    try {
      const db = getDb();
      for (const table of TABLES) {
        db.prepare(`DELETE FROM ${table}`).run();
      }
      const result = await loadComciganData(db, schoolName);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  // Auth
  ipcMain.handle(IPC.AUTH_LOGIN, async (_event, email: string, password: string) => {
    return login(email, password);
  });

  ipcMain.handle(IPC.AUTH_LOGOUT, async () => {
    return logout();
  });

  ipcMain.handle(IPC.AUTH_GET_USER, () => {
    return { success: true, data: getCurrentUser() };
  });

  ipcMain.handle(IPC.DB_QUERY, (_event, sql: string, params?: unknown[]) => {
    try {
      const db = getDb();
      const rows = db.prepare(sql).all(...(params || []));
      return { success: true, data: rows };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle(IPC.DB_EXECUTE, (_event, sql: string, params?: unknown[]) => {
    try {
      const db = getDb();
      db.prepare(sql).run(...(params || []));
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });
}
