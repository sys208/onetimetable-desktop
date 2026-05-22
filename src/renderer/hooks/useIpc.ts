import type { IpcResult } from "../../shared/types";

declare global {
  interface Window {
    electronAPI: {
      invoke: (channel: string, ...args: unknown[]) => Promise<IpcResult>;
      on: (channel: string, callback: (...args: unknown[]) => void) => () => void;
    };
  }
}

export async function ipcInvoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T> {
  const result = await window.electronAPI.invoke(channel, ...args);
  if (!result.success) throw new Error(result.error || "IPC call failed");
  return result.data as T;
}
