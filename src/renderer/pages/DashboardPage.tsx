import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { dbQuery } from "../creator/hooks/useCreatorDb";
import { COLORS } from "../../shared/constants";

interface TimetableRow {
  date: string; period: number; class_id: string; subject: string;
  teacher_id: string; is_fixed: number; change_type: string | null;
}
interface Teacher { id: number; seq: number; name: string; }
interface ClassRow { name: string; }
interface ChangeReq { id: string; requester_id: string; status: string; reason: string; reason_detail: string; created_at: string; }
interface Notice { id: string; title: string; class_id: string; target_period: number | null; created_at: string; }
interface SchoolEvent { name: string; type: string; start_date: string; end_date: string; }
interface Settings { school_name: string; }

function getWeekDates(today: Date): Date[] {
  const d = new Date(today);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return Array.from({ length: 5 }, (_, i) => {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    return dd;
  });
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const dayLabels = ["월", "화", "수", "목", "금"];

export function DashboardPage() {
  const { user } = useAuthStore();
  const today = new Date();
  const todayStr = fmtDate(today);
  const weekDates = getWeekDates(today);
  const todayIndex = weekDates.findIndex((d) => fmtDate(d) === todayStr);

  const [timetable, setTimetable] = useState<TimetableRow[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [requests, setRequests] = useState<ChangeReq[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [settings, setSettings] = useState<Settings>({ school_name: "" });
  const [viewMode, setViewMode] = useState<"all" | string>("all");

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const dateStrs = weekDates.map(fmtDate);
    const placeholders = dateStrs.map(() => "?").join(",");

    const tt = await dbQuery<TimetableRow>(`SELECT * FROM timetable WHERE date IN (${placeholders})`, dateStrs);
    setTimetable(tt);

    setTeachers(await dbQuery<Teacher>("SELECT id, seq, name FROM teachers ORDER BY seq"));
    setClasses(await dbQuery<ClassRow>("SELECT DISTINCT name FROM classes ORDER BY name"));
    setRequests(await dbQuery<ChangeReq>("SELECT * FROM change_requests ORDER BY created_at DESC LIMIT 5"));
    setNotices(await dbQuery<Notice>("SELECT id, title, class_id, target_period, created_at FROM class_notices ORDER BY created_at DESC LIMIT 5"));
    setEvents(await dbQuery<SchoolEvent>("SELECT name, type, start_date, end_date FROM events ORDER BY start_date LIMIT 5"));

    const s = await dbQuery<Settings>("SELECT school_name FROM settings WHERE id = 1");
    if (s.length > 0) setSettings(s[0]!);
  }

  // 내가 담당하는 반 목록 추출
  const myClasses = [...new Set(timetable.map((r) => r.class_id))].sort();

  // 필터링된 시간표
  const filtered = viewMode === "all" ? timetable : timetable.filter((r) => r.class_id === viewMode);

  // 오늘 변경사항
  const todayChanges = timetable.filter((r) => r.date === todayStr && r.change_type);

  // 교사 이름 맵
  const teacherNames: Record<string, string> = {};
  for (const t of teachers) teacherNames[String(t.id)] = t.name;

  function getCell(dateStr: string, period: number): TimetableRow | undefined {
    return filtered.find((r) => r.date === dateStr && r.period === period);
  }

  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const totalTeachers = teachers.length;
  const totalClasses = classes.length;
  const pendingRequests = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-lg font-bold text-slate-800">{dateStr} {dayNames[today.getDay()]}요일</h1>
        <span className="text-sm text-slate-500">
          {settings.school_name}{user?.homeroom ? ` | 담임: ${user.homeroom}` : ""}
        </span>
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-3">
        {/* 왼쪽 */}
        <div className="space-y-3">
          {/* 시간표 */}
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-sm text-slate-800">내 시간표 (이번 주)</h2>
              <div className="flex gap-1 text-xs flex-wrap">
                <button onClick={() => setViewMode("all")}
                  className={`px-2 py-0.5 rounded ${viewMode === "all" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                  전체
                </button>
                {myClasses.slice(0, 8).map((cls) => (
                  <button key={cls} onClick={() => setViewMode(cls)}
                    className={`px-2 py-0.5 rounded ${viewMode === cls ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length > 0 ? (
              <>
                <table className="w-full border-collapse text-[11px]">
                  <thead>
                    <tr>
                      <th className="border border-slate-200 bg-slate-50 px-2 py-1.5 w-10 text-slate-600">교시</th>
                      {weekDates.map((d, i) => (
                        <th key={i} className={`border border-slate-200 px-2 py-1.5 ${i === todayIndex ? "bg-yellow-50 font-bold" : "bg-slate-50"} text-slate-600`}>
                          {d.getMonth() + 1}/{d.getDate()}({dayLabels[i]})
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 7 }, (_, p) => p + 1).map((period) => (
                      <tr key={period}>
                        <td className="border border-slate-200 bg-slate-50 px-2 py-1.5 text-center font-bold text-slate-600">{period}</td>
                        {weekDates.map((d, i) => {
                          const ds = fmtDate(d);
                          const cell = getCell(ds, period);
                          const style: React.CSSProperties = {};
                          if (cell?.change_type === "moved") style.backgroundColor = COLORS.changed;
                          if (cell?.change_type === "substituted") style.backgroundColor = COLORS.substitute;
                          if (cell?.is_fixed) { style.color = COLORS.fixed; style.fontWeight = "bold"; }
                          if (i === todayIndex && !cell?.change_type) style.backgroundColor = style.backgroundColor || "#fffbeb80";

                          return (
                            <td key={i} className="border border-slate-200 px-1.5 py-1.5 text-center" style={style}>
                              {cell ? `${cell.subject}/${cell.class_id}` : ""}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex gap-4 mt-1.5 text-[9px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS.changed }} /> 변경
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS.substitute }} /> 보강
                  </span>
                  <span style={{ color: COLORS.fixed, fontWeight: "bold" }}>빨강 = 고정</span>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">시간표 데이터가 없습니다. 컴시간 또는 데모 모드로 불러오세요.</p>
            )}
          </div>

          {/* 오늘 변경사항 */}
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <h2 className="font-bold text-sm text-slate-800 mb-2">오늘 변경사항</h2>
            {todayChanges.length > 0 ? (
              <div className="space-y-1">
                {todayChanges.map((c, i) => (
                  <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs ${
                    c.change_type === "moved" ? "bg-yellow-50" : "bg-green-50"
                  }`}>
                    <span className={`inline-block w-2 h-2 rounded-full ${
                      c.change_type === "moved" ? "bg-yellow-400" : "bg-green-400"
                    }`} />
                    <span>{c.period}교시 {c.subject}/{c.class_id} — {c.change_type === "moved" ? "이동" : "보강"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">오늘 변경사항이 없습니다</p>
            )}
          </div>
        </div>

        {/* 오른쪽 */}
        <div className="space-y-3">
          {/* 결재 요청 */}
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-sm text-slate-800">결재 요청</h2>
              {pendingRequests > 0 && (
                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">{pendingRequests}건</span>
              )}
            </div>
            {requests.length > 0 ? (
              <div className="space-y-1.5">
                {requests.map((r) => (
                  <div key={r.id} className="text-xs border-b border-slate-100 pb-1.5">
                    <div className="flex justify-between">
                      <span className="font-bold">{r.requester_id}</span>
                      <span className={`text-[10px] px-1 py-0.5 rounded ${
                        r.status === "pending" ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"
                      }`}>{r.status === "pending" ? "대기" : "완료"}</span>
                    </div>
                    <div className="text-slate-500">{r.reason} {r.reason_detail}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">대기 중인 결재가 없습니다</p>
            )}
          </div>

          {/* 학급 공지 */}
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-sm text-slate-800">학급 공지</h2>
            </div>
            {notices.length > 0 ? (
              <div className="space-y-1">
                {notices.map((n) => (
                  <div key={n.id} className="text-xs bg-slate-50 rounded px-2 py-1.5">
                    <div className="font-bold">{n.title}</div>
                    <div className="text-slate-400 text-[10px]">
                      {n.class_id} | {n.target_period ? `${n.target_period}교시` : "전체"} | {n.created_at}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">공지가 없습니다</p>
            )}
          </div>

          {/* 학사일정 */}
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <h2 className="font-bold text-sm text-slate-800 mb-2">학사일정</h2>
            {events.length > 0 ? (
              <div className="space-y-1 text-xs">
                {events.map((e, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{e.name}</span>
                    <span className="text-slate-400">{e.start_date}{e.end_date !== e.start_date ? ` ~ ${e.end_date}` : ""}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">등록된 일정이 없습니다</p>
            )}
          </div>

          {/* 통계 */}
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <h2 className="font-bold text-sm text-slate-800 mb-2">통계</h2>
            <div className="grid grid-cols-2 gap-1 text-xs text-slate-600">
              <span>교사 {totalTeachers}명</span>
              <span>학반 {totalClasses}개</span>
              <span>이번주 수업 {timetable.length}건</span>
              <span>미처리 신청 {pendingRequests}건</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
