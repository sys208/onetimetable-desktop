import { useState, useEffect } from "react";
import { dbExecute, dbQuery } from "../hooks/useCreatorDb";

interface Teacher { id: number; seq: number; name: string; }
interface Subject { id: number; name: string; }
interface Assignment { teacher_id: number; subject_id: number; class_id: number; }
interface ManualAssign { id: number; teacher_id: number; subject_id: number; class_id: number; day: number; period: number; }
interface Settings { max_periods_per_day: number; base_days: number; }
interface DayName { day_number: number; name: string; }

export function ManualAssignStep() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selTeacher, setSelTeacher] = useState<number | null>(null);
  const [teacherSubjects, setTeacherSubjects] = useState<{ subject_id: number; class_id: number; subject_name: string; class_name: string }[]>([]);
  const [selSubjectClass, setSelSubjectClass] = useState<string | null>(null);
  const [manuals, setManuals] = useState<ManualAssign[]>([]);
  const [settings, setSettings] = useState<Settings>({ max_periods_per_day: 7, base_days: 5 });
  const [dayNames, setDayNames] = useState<string[]>(["월", "화", "수", "목", "금"]);

  useEffect(() => { loadInitial(); }, []);

  async function loadInitial() {
    const t = await dbQuery<Teacher>("SELECT id, seq, name FROM teachers ORDER BY seq");
    setTeachers(t);
    if (t.length > 0) setSelTeacher(t[0]!.id);
    const s = await dbQuery<Settings>("SELECT max_periods_per_day, base_days FROM settings WHERE id = 1");
    if (s.length > 0) setSettings(s[0]!);
    const d = await dbQuery<DayName>("SELECT day_number, name FROM day_names ORDER BY day_number");
    if (d.length > 0) setDayNames(d.map((x) => x.name));
  }

  useEffect(() => {
    if (selTeacher) {
      loadTeacherData(selTeacher);
    }
  }, [selTeacher]);

  async function loadTeacherData(teacherId: number) {
    const subs = await dbQuery<{ subject_id: number; class_id: number; subject_name: string; class_name: string }>(
      `SELECT ta.subject_id, ta.class_id, s.name as subject_name, c.name as class_name
       FROM teacher_assignments ta
       JOIN subjects s ON s.id = ta.subject_id
       JOIN classes c ON c.id = ta.class_id
       WHERE ta.teacher_id = ?`, [teacherId]
    );
    setTeacherSubjects(subs);
    const m = await dbQuery<ManualAssign>("SELECT * FROM manual_assignments WHERE teacher_id = ?", [teacherId]);
    setManuals(m);
  }

  async function toggleCell(day: number, period: number) {
    if (!selTeacher || !selSubjectClass) return;
    const [subjectId, classId] = selSubjectClass.split("-").map(Number);
    if (!subjectId || !classId) return;

    const existing = manuals.find(
      (m) => m.teacher_id === selTeacher && m.day === day && m.period === period
    );

    if (existing) {
      await dbExecute("DELETE FROM manual_assignments WHERE id = ?", [existing.id]);
    } else {
      await dbExecute(
        "INSERT INTO manual_assignments (teacher_id, subject_id, class_id, day, period) VALUES (?, ?, ?, ?, ?)",
        [selTeacher, subjectId, classId, day, period]
      );
    }
    await loadTeacherData(selTeacher);
  }

  function getCellContent(day: number, period: number): string {
    const m = manuals.find((x) => x.day === day && x.period === period);
    if (!m) return "";
    const sc = teacherSubjects.find((s) => s.subject_id === m.subject_id && s.class_id === m.class_id);
    return sc ? `${sc.subject_name}/${sc.class_name}` : "?";
  }

  function isCellAssigned(day: number, period: number): boolean {
    return manuals.some((x) => x.day === day && x.period === period);
  }

  return (
    <div>
      <p className="text-xs text-slate-500 mb-3">
        특정 요일/시간에 반드시 수업해야 하는 경우 수동 배정합니다. 가능한 자동배정에 맡기세요.
      </p>

      <div className="flex gap-3 h-[420px]">
        {/* 교사 목록 */}
        <div className="w-32 shrink-0 border border-slate-200 rounded overflow-y-auto">
          <div className="bg-slate-50 px-2 py-1 text-xs font-bold text-slate-500 sticky top-0 border-b border-slate-200">교사</div>
          {teachers.map((t) => (
            <button key={t.id} onClick={() => setSelTeacher(t.id)}
              className={`w-full text-left px-2 py-1 text-xs ${selTeacher === t.id ? "bg-blue-500 text-white" : "hover:bg-slate-50"}`}>
              {t.seq} {t.name}
            </button>
          ))}
        </div>

        {/* 과목/학반 선택 */}
        <div className="w-36 shrink-0 border border-slate-200 rounded overflow-y-auto">
          <div className="bg-slate-50 px-2 py-1 text-xs font-bold text-slate-500 sticky top-0 border-b border-slate-200">과목/학반</div>
          {teacherSubjects.map((s, i) => {
            const key = `${s.subject_id}-${s.class_id}`;
            return (
              <button key={i} onClick={() => setSelSubjectClass(key)}
                className={`w-full text-left px-2 py-1 text-xs ${selSubjectClass === key ? "bg-blue-500 text-white" : "hover:bg-slate-50"}`}>
                {s.subject_name}/{s.class_name}
              </button>
            );
          })}
          {teacherSubjects.length === 0 && <p className="text-xs text-slate-400 p-2">수업배당이 없습니다</p>}
        </div>

        {/* 시간표 그리드 */}
        <div className="flex-1 overflow-auto">
          <table className="border-collapse text-xs w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-200 px-2 py-1.5 w-10">교시</th>
                {dayNames.slice(0, settings.base_days).map((d, i) => (
                  <th key={i} className="border border-slate-200 px-2 py-1.5">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: settings.max_periods_per_day }, (_, p) => p + 1).map((period) => (
                <tr key={period}>
                  <td className="border border-slate-200 px-2 py-1 text-center font-bold text-slate-500">{period}</td>
                  {Array.from({ length: settings.base_days }, (_, d) => d + 1).map((day) => {
                    const assigned = isCellAssigned(day, period);
                    const content = getCellContent(day, period);
                    return (
                      <td key={day}
                        onClick={() => toggleCell(day, period)}
                        className={`border border-slate-200 px-2 py-1 text-center cursor-pointer hover:bg-blue-50 ${
                          assigned ? "bg-blue-100 font-bold text-blue-700" : ""
                        }`}>
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
