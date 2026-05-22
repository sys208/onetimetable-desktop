import { ipcMain } from "electron";
import { getDb } from "./db/connection";
import { login, logout, getCurrentUser } from "./firebase/auth";
import { IPC } from "../shared/constants";

export function registerIpcHandlers() {
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
      const rows = db.query(sql).all(...(params || []));
      return { success: true, data: rows };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle(IPC.DB_EXECUTE, (_event, sql: string, params?: unknown[]) => {
    try {
      const db = getDb();
      db.run(sql, ...(params || []));
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });
}
