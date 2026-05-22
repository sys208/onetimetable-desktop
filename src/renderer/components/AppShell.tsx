import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { DashboardPage } from "../pages/DashboardPage";
import { CreatorPage } from "../pages/CreatorPage";
import { ManagerPage } from "../pages/ManagerPage";
import { SettingsPage } from "../pages/SettingsPage";

type Tab = "dashboard" | "creator" | "manager" | "settings";

const TAB_LABELS: Record<Tab, string> = {
  dashboard: "대시보드",
  creator: "작성",
  manager: "관리",
  settings: "설정",
};

export function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const { user, logout } = useAuthStore();

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between shrink-0">
        <span className="text-blue-400 font-bold text-base">오늘시간표</span>

        <div className="flex gap-1">
          {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === tab
                  ? "bg-blue-500 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-xs">
            {user?.name} {user?.role === "admin" ? "(수업계)" : "선생님"}
          </span>
          <button
            onClick={logout}
            className="text-slate-500 text-xs hover:text-slate-300"
          >
            로그아웃
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-slate-50">
        {activeTab === "dashboard" && <DashboardPage />}
        {activeTab === "creator" && <CreatorPage />}
        {activeTab === "manager" && <ManagerPage />}
        {activeTab === "settings" && <SettingsPage />}
      </div>
    </div>
  );
}
