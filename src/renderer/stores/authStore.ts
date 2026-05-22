import { create } from "zustand";
import type { User } from "../../shared/types";
import { IPC } from "../../shared/constants";
import { ipcInvoke } from "../hooks/useIpc";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const user = await ipcInvoke<User>(IPC.AUTH_LOGIN, email, password);
      set({ user, loading: false });
      return true;
    } catch (err) {
      set({ error: String(err), loading: false });
      return false;
    }
  },

  logout: async () => {
    await ipcInvoke(IPC.AUTH_LOGOUT);
    set({ user: null });
  },

  checkAuth: async () => {
    try {
      const user = await ipcInvoke<User | null>(IPC.AUTH_GET_USER);
      set({ user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
}));
