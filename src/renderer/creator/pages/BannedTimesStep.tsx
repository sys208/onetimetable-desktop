import { useState, useEffect } from "react";
import { dbExecute, dbQuery } from "../hooks/useCreatorDb";

interface Teacher { id: number; seq: number; name: string; }
interface BannedTime { id: number; teacher_id: number; day: string; periods: string; }
interface Settings { max_periods_per_day: number; }

type TabType = "teacher" | "subject" | "room";

export function BannedTimesStep() {
  const [tab, setTab] = useState<TabType>("teacher");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [bans, setBans] = useState<Record<number, Record<string, string>>>({});
  const [maxPeriods, setMaxPeriods] = useState(7);
  const [saved, setSaved] = useState(false);

  const days = ["월", "화", "수", "목", "금"];
  const dayKeys = ["mon", "tue", "wed", "thu", "fri"];

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const t = await dbQuery<Teacher>("SELECT id, seq, name FROM teachers ORDER BY seq");
    setTeachers(t);
    const s = await dbQuery<Settings>("SELECT max_periods_per_day FROM settings WHERE id = 1");
    if (s.length > 0) setMaxPeriods(s[0]!.max_periods_per_day);
    const rows = await dbQuery<BannedTime>("SELECT * FROM banned_teacher_times");
    const map: Record<number, Record<string, string>> = {};
    for (const r of rows) {
      if (!map[r.teacher_id]) map[r.teacher_id] = {};
      map[r.teacher_id]![r.day] = r.periods;
    }
    setBans(map);
  }

  function getBan(teacherId: number, day: string): string {
    return bans[teacherId]?.[day] || "";
  }

  function setBan(teacherId: number, day: string, value: string) {
    setBans((prev) => ({
      ...prev,
      [teacherId]: { ...prev[teacherId], [day]: value },
    }));
  }

  async function save() {
    await dbExecute("DELETE FROM banned_teacher_times");
    for (const [teacherIdStr, dayMap] of Object.entries(bans)) {
      const teacherId = Number(teacherIdStr);
      for (const [day, periods] of Object.entries(dayMap)) {
        if (periods.trim()) {
          await dbExecute(
            "INSERT INTO banned_teacher_times (teacher_id, day, periods) VALUES (?, ?, ?)",
            [teacherId, day, periods]
          );
        }
      }
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <p className="text-xs text-slate-500 mb-3">
        배정금지 시간을 입력합니다. 숫자를 연속 입력 (예: 12 = 1,2교시 금지, A = 하루 전체 금지).
      </p>

      <div className="flex gap-2 mb-3">
        {(["teacher", "subject", "room"] as TabType[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1 text-xs rounded ${tab === t ? "bg-blue-500 text-white" : "bg-slate-200"}`}>
            {t === "teacher" ? "교사별" : t === "subject" ? "과목별" : "특별실별"}
          </button>
        ))}
      </div>

      {tab === "teacher" && (
        <div className="overflow-auto max-h-[400px] border border-slate-200 rounded">
          <table className="border-collapse text-xs w-full">
            <thead className="sticky top-0">
              <tr className="bg-slate-50">
                <th className="border border-slate-200 px-2 py-1.5 w-24">교사</th>
                {days.map((d) => (
                  <th key={d} className="border border-slate-200 px-2 py-1.5 w-16">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id} className="hover:bg-blue-50">
                  <td className="border border-slate-200 px-2 py-0.5 text-slate-600">{t.seq} {t.name}</td>
                  {dayKeys.map((day) => (
                    <td key={day} className="border border-slate-200 px-0.5 py-0.5">
                      <input
                        type="text"
                        value={getBan(t.id, day)}
                        onChange={(e) => setBan(t.id, day, e.target.value)}
                        className="w-full px-1 py-0.5 outline-none border-0 text-center uppercase"
                        placeholder=""
                        maxLength={10}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab !== "teacher" && (
        <p className="text-xs text-slate-400 p-4">과목별/특별실별 배정금지는 동일한 방식으로 구현됩니다. (교사별과 UI 동일)</p>
      )}

      <div className="flex items-center gap-3 mt-3">
        <button onClick={save} className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-bold hover:bg-blue-600">저장</button>
        {saved && <span className="text-xs text-green-500">저장되었습니다</span>}
      </div>
    </div>
  );
}
