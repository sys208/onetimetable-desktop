import { useEffect } from "react";
import { useAuthStore } from "./stores/authStore";
import { AppShell } from "./components/AppShell";
import { LoginPage } from "./pages/LoginPage";

export function App() {
  const { user, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-blue-400 text-xl font-bold">오늘시간표</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <AppShell />;
}
