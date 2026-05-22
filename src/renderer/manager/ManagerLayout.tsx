import { useState } from "react";
import { WeeklyView } from "./pages/WeeklyView";
import { DailyView } from "./pages/DailyView";
import { ChangeRequestsView } from "./pages/ChangeRequestsView";
import { EventsView } from "./pages/EventsView";
import { NoticeView } from "./pages/NoticeView";
import { SelectorPanel } from "./components/SelectorPanel";
import { NotificationPanel } from "./components/NotificationPanel";

type SubTab = "weekly" | "daily" | "changes" | "events" | "notices";

const SUB_TABS: { id: SubTab; label: string; badge?: boolean }[] = [
  { id: "weekly", label: "주간시간표" },
  { id: "daily", label: "일일시간표" },
  { id: "changes", label: "수업변경" },
  { id: "events", label: "학사일정" },
  { id: "notices", label: "학급공지" },
];

export function ManagerLayout() {
  const [subTab, setSubTab] = useState<SubTab>("weekly");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectorType, setSelectorType] = useState<"teacher" | "class" | "room">("teacher");

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);

  function moveDate(days: number) {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(d);
  }

  function moveWeek(weeks: number) {
    moveDate(weeks * 7);
  }

  const dateStr = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일`;
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const dayStr = dayNames[currentDate.getDay()] + "요일";

  return (
    <div className="flex flex-col h-full">
      {/* Sub tabs */}
      <div className="bg-white border-b border-slate-200 px-3 py-1 flex gap-1 shrink-0">
        {SUB_TABS.map((tab) => (
          <button key={tab.id} onClick={() => setSubTab(tab.id)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              subTab === tab.id ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-500 hover:bg-slate-100"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center gap-2 shrink-0 text-xs">
        <button className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-blue-600">백업</button>
        <button className="px-2 py-1 bg-green-50 border border-green-200 rounded text-green-600">시간표알림</button>
        <button className="px-2 py-1 bg-yellow-50 border border-yellow-200 rounded text-yellow-600">수업없는 교사</button>
        <button className="px-2 py-1 bg-pink-50 border border-pink-200 rounded text-pink-600">수업적은 교사</button>
        <div className="flex-1" />
        <span className="font-semibold text-slate-700">{dateStr} {dayStr}</span>
        <div className="flex gap-0.5 ml-2">
          <button onClick={() => moveWeek(-1)} className="px-2 py-0.5 bg-slate-200 rounded hover:bg-slate-300">≪</button>
          <button onClick={() => moveDate(-1)} className="px-2 py-0.5 bg-slate-200 rounded hover:bg-slate-300">＜</button>
          <button onClick={() => setCurrentDate(new Date())} className="px-2 py-0.5 bg-blue-500 text-white rounded font-bold">오늘</button>
          <button onClick={() => moveDate(1)} className="px-2 py-0.5 bg-slate-200 rounded hover:bg-slate-300">＞</button>
          <button onClick={() => moveWeek(1)} className="px-2 py-0.5 bg-slate-200 rounded hover:bg-slate-300">≫</button>
        </div>
      </div>

      {/* 3-panel content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Selector (only for timetable views) */}
        {(subTab === "weekly" || subTab === "daily") && (
          <SelectorPanel
            type={selectorType}
            onTypeChange={setSelectorType}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        )}

        {/* Center: Main content */}
        <div className="flex-1 overflow-auto">
          {subTab === "weekly" && <WeeklyView date={currentDate} selectedId={selectedId} selectorType={selectorType} />}
          {subTab === "daily" && <DailyView date={currentDate} selectedId={selectedId} selectorType={selectorType} />}
          {subTab === "changes" && <ChangeRequestsView />}
          {subTab === "events" && <EventsView />}
          {subTab === "notices" && <NoticeView />}
        </div>

        {/* Right: Notifications (only for timetable views) */}
        {(subTab === "weekly" || subTab === "daily") && (
          <NotificationPanel />
        )}
      </div>
    </div>
  );
}
