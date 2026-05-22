import { useAuthStore } from "../stores/authStore";
import { TimetableGrid } from "../components/TimetableGrid";

export function DashboardPage() {
  const { user } = useAuthStore();

  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const dayStr = dayNames[today.getDay()] + "요일";

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-lg font-bold text-slate-800">{dateStr} {dayStr}</h1>
        <span className="text-sm text-slate-500">
          {user?.homeroom ? `담임: ${user.homeroom}` : ""}
        </span>
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-3">
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-sm text-slate-800">내 시간표 (이번 주)</h2>
              <div className="flex gap-1 text-xs">
                <button className="px-2 py-0.5 bg-blue-500 text-white rounded">전체</button>
              </div>
            </div>
            <TimetableGrid />
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <h2 className="font-bold text-sm text-slate-800 mb-2">오늘 변경사항</h2>
            <p className="text-xs text-slate-400">변경사항이 없습니다.</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-sm text-slate-800">결재 요청</h2>
            </div>
            <p className="text-xs text-slate-400">대기 중인 결재가 없습니다.</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-sm text-slate-800">학급 공지</h2>
              <button className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded">+ 새 공지</button>
            </div>
            <p className="text-xs text-slate-400">공지가 없습니다.</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <h2 className="font-bold text-sm text-slate-800 mb-2">학사일정</h2>
            <p className="text-xs text-slate-400">등록된 일정이 없습니다.</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <h2 className="font-bold text-sm text-slate-800 mb-2">통계</h2>
            <p className="text-xs text-slate-400">시간표를 불러오면 통계가 표시됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
