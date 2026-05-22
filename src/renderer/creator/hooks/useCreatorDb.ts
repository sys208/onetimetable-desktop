import { useState, useEffect, useCallback } from "react";
import { ipcInvoke } from "../../hooks/useIpc";
import { IPC } from "../../../shared/constants";

export function useDbQuery<T>(sql: string, params?: unknown[], deps?: unknown[]) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await ipcInvoke<T[]>(IPC.DB_QUERY, sql, params);
      setData(rows);
    } catch (err) {
      console.error("DB query error:", err);
      setData([]);
    }
    setLoading(false);
  }, [sql, ...(deps || [])]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, refresh };
}

export async function dbExecute(sql: string, params?: unknown[]) {
  await ipcInvoke(IPC.DB_EXECUTE, sql, params);
}

export async function dbQuery<T>(sql: string, params?: unknown[]): Promise<T[]> {
  return ipcInvoke<T[]>(IPC.DB_QUERY, sql, params);
}
