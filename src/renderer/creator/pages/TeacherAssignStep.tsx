import { useState, useEffect } from "react";
import { dbExecute, dbQuery } from "../hooks/useCreatorDb";

interface Teacher { id: number; seq: number; name: string; }
interface Department { id: number; grade: number; name: string; }
interface Subject { id: number; department_id: number; name: string; hours: number; }
interface ClassRow { id: number; department_id: number; name: string; }
interface Assignment { id: number; teacher_id: number; department_id: number; subject_id: number; class_id: number; }

export function TeacherAssignStep() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [depts, setDepts] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [selTeacher, setSelTeacher] = useState<number | null>(null);
  const [selDept, setSelDept] = useState<number | null>(null);
  const [selSubject, setSelSubject] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const t = await dbQuery<Teacher>("SELECT id, seq, name FROM teachers ORDER BY seq");
    const d = await dbQuery<Department>("SELECT id, grade, name FROM departments ORDER BY id");
    setTeachers(t);
    setDepts(d);
    if (t.length > 0) setSelTeacher(t[0]!.id);
    if (d.length > 0) setSelDept(d[0]!.id);
  }

  useEffect(() => {
    if (selDept) {
      dbQuery<Subject>("SELECT id, department_id, name, hours FROM subjects WHERE department_id = ? ORDER BY id", [selDept]).then(setSubjects);
      dbQuery<ClassRow>("SELECT id, department_id, name FROM classes WHERE department_id = ? ORDER BY id", [selDept]).then(setClasses);
    }
  }, [selDept]);

  useEffect(() => {
    if (selTeacher) {
      dbQuery<Assignment>("SELECT * FROM teacher_assignments WHERE teacher_id = ?", [selTeacher]).then(setAssignments);
    }
  }, [selTeacher]);

  async function toggleClass(classId: number) {
    if (!selTeacher || !selDept || !selSubject) return;
    const existing = assignments.find(
      (a) => a.teacher_id === selTeacher && a.subject_id === selSubject && a.class_id === classId
    );
    if (existing) {
      await dbExecute("DELETE FROM teacher_assignments WHERE id = ?", [existing.id]);
    } else {
      await dbExecute(
        "INSERT INTO teacher_assignments (teacher_id, department_id, subject_id, class_id) VALUES (?, ?, ?, ?)",
        [selTeacher, selDept, selSubject, classId]
      );
    }
    const updated = await dbQuery<Assignment>("SELECT * FROM teacher_assignments WHERE teacher_id = ?", [selTeacher]);
    setAssignments(updated);
  }

  const teacherHours = assignments.length;
  const selectedTeacherName = teachers.find((t) => t.id === selTeacher)?.name || "";

  const assignedClassIds = new Set(
    assignments.filter((a) => a.subject_id === selSubject).map((a) => a.class_id)
  );

  return (
    <div>
      <p className="text-xs text-slate-500 mb-3">
        교사를 선택 → 계열 → 과목 → 수업할 학반을 클릭(토글)합니다.
      </p>

      <div className="flex gap-3 h-[420px]">
        {/* 1. 교사 목록 */}
        <div className="w-36 shrink-0 border border-slate-200 rounded overflow-y-auto">
          <div className="bg-slate-50 px-2 py-1 text-xs font-bold text-slate-500 sticky top-0 border-b border-slate-200">교사</div>
          {teachers.map((t) => (
            <button key={t.id} onClick={() => setSelTeacher(t.id)}
              className={`w-full text-left px-2 py-1 text-xs ${selTeacher === t.id ? "bg-blue-500 text-white" : "hover:bg-slate-50"}`}>
              {t.seq} {t.name}
            </button>
          ))}
        </div>

        {/* 2. 계열 */}
        <div className="w-28 shrink-0 border border-slate-200 rounded overflow-y-auto">
          <div className="bg-slate-50 px-2 py-1 text-xs font-bold text-slate-500 sticky top-0 border-b border-slate-200">계열</div>
          {depts.map((d) => (
            <button key={d.id} onClick={() => setSelDept(d.id)}
              className={`w-full text-left px-2 py-1 text-xs ${selDept === d.id ? "bg-blue-500 text-white" : "hover:bg-slate-50"}`}>
              {d.grade}학년 {d.name}
            </button>
          ))}
        </div>

        {/* 3. 과목 */}
        <div className="w-32 shrink-0 border border-slate-200 rounded overflow-y-auto">
          <div className="bg-slate-50 px-2 py-1 text-xs font-bold text-slate-500 sticky top-0 border-b border-slate-200">과목(시수)</div>
          {subjects.map((s) => (
            <button key={s.id} onClick={() => setSelSubject(s.id)}
              className={`w-full text-left px-2 py-1 text-xs ${selSubject === s.id ? "bg-blue-500 text-white" : "hover:bg-slate-50"}`}>
              {s.name}({s.hours})
            </button>
          ))}
        </div>

        {/* 4. 학반 */}
        <div className="w-36 shrink-0 border border-slate-200 rounded overflow-y-auto">
          <div className="bg-slate-50 px-2 py-1 text-xs font-bold text-slate-500 sticky top-0 border-b border-slate-200">학반/담당교사</div>
          {classes.map((c) => {
            const isAssigned = assignedClassIds.has(c.id);
            return (
              <button key={c.id} onClick={() => toggleClass(c.id)}
                className={`w-full text-left px-2 py-1 text-xs ${isAssigned ? "bg-blue-100 text-blue-700 font-bold" : "hover:bg-slate-50"}`}>
                {c.name} {isAssigned ? "✓" : ""}
              </button>
            );
          })}
        </div>

        {/* 5. 현재 배당 현황 */}
        <div className="flex-1 border border-slate-200 rounded overflow-y-auto">
          <div className="bg-slate-50 px-2 py-1 text-xs font-bold text-slate-500 sticky top-0 border-b border-slate-200">
            {selectedTeacherName} — {teacherHours}시간
          </div>
          <div className="p-2 text-xs space-y-0.5">
            {assignments.map((a, i) => {
              const subj = subjects.find((s) => s.id === a.subject_id);
              const cls = classes.find((c) => c.id === a.class_id);
              return (
                <div key={i} className="flex justify-between px-1 py-0.5 bg-slate-50 rounded">
                  <span>{subj?.name || "?"} — {cls?.name || "?"}</span>
                </div>
              );
            })}
            {assignments.length === 0 && <p className="text-slate-400">배당된 수업이 없습니다</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
