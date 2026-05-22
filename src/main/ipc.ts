import { ipcMain } from "electron";
import { getDb } from "./db/connection";
import { IPC } from "../shared/constants";

export function registerIpcHandlers() {
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
