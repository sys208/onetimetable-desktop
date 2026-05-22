import { useState, useEffect } from "react";
import { dbExecute, dbQuery } from "../hooks/useCreatorDb";

interface Department { id: number; grade: number; name: string; }
interface Subject {
  id: number; department_id: number; name: string; hours: number;
  consecutive: string; same_group: string; similar_group: string;
  priority: number; teacher_count: number; neis_name: string;
}

export function SubjectsStep() {
  const [depts, setDepts] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadDepts(); }, []);
  useEffect(() => { if (selectedDept) loadSubjects(selectedDept); }, [selectedDept]);

  async function loadDepts() {
    const rows = await dbQuery<Department>("SELECT id, grade, name FROM departments ORDER BY id");
    setDepts(rows);
    if (rows.length > 0) setSelectedDept(rows[0]!.id);
  }

  async function loadSubjects(deptId: number) {
    const rows = await dbQuery<Subject>("SELECT * FROM subjects WHERE department_id = ? ORDER BY id", [deptId]);
    setSubjects(rows);
  }

  async function save() {
    if (!selectedDept) return;
    await dbExecute("DELETE FROM subjects WHERE department_id = ?", [selectedDept]);
    for (const s of subjects) {
      await dbExecute(
        `INSERT INTO subjects (department_id, name, hours, consecutive, same_group, similar_group, priority, teacher_count, neis_name)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [selectedDept, s.name, s.hours, s.consecutive, s.same_group, s.similar_group, s.priority, s.teacher_count, s.neis_name]
      );
    }
    await loadSubjects(selectedDept);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addSubject() {
    if (!selectedDept) return;
    setSubjects([...subjects, {
      id: 0, department_id: selectedDept, name: "", hours: 1,
      consecutive: "", same_group: "", similar_group: "",
      priority: 0, teacher_count: 1, neis_name: "",
    }]);
  }

  function removeSubject(idx: number) {
    setSubjects(subjects.filter((_, i) => i !== idx));
  }

  function updateSubject(idx: number, field: keyof Subject, value: unknown) {
    const newList = [...subjects];
    (newList[idx] as any)[field] = value;
    setSubjects(newList);
  }

  const totalHours = subjects.reduce((sum, s) => sum + s.hours, 0);

  return (
    <div>
      <p className="text-xs text-slate-500 mb-3">
        과목명은 한글 2자로 입력 (부득이한 경우 4자). 시수는 주당 수업 시간수.
        연속/동일/유사/순배/교사수는 필요한 경우에만 입력.
      </p>

      <div className="flex gap-4">
        <div className="w-36 shrink-0">
          <div className="text-xs font-bold text-slate-500 mb-1">계열</div>
          {depts.map((d) => (
            <button key={d.id} onClick={() => setSelectedDept(d.id)}
              className={`w-full text-left px-2 py-1 text-xs rounded mb-0.5 ${selectedDept === d.id ? "bg-blue-500 text-white" : "hover:bg-slate-100"}`}>
              {d.grade}학년 {d.name}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-x-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs text-slate-600">과목수: <strong>{subjects.length}</strong> | 시수합: <strong>{totalHours}</strong></span>
            <button onClick={addSubject} className="px-3 py-1 text-xs bg-slate-200 rounded hover:bg-slate-300">+ 추가</button>
          </div>

          <div className="overflow-y-auto max-h-[380px] border border-slate-200 rounded">
            <table className="border-collapse text-xs w-full">
              <thead className="sticky top-0">
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 px-1 py-1 w-8">#</th>
                  <th className="border border-slate-200 px-1 py-1 w-16">과목명</th>
                  <th className="border border-slate-200 px-1 py-1 w-12">시수</th>
                  <th className="border border-slate-200 px-1 py-1 w-16">연속</th>
                  <th className="border border-slate-200 px-1 py-1 w-12">동일</th>
                  <th className="border border-slate-200 px-1 py-1 w-12">유사</th>
                  <th className="border border-slate-200 px-1 py-1 w-12">순배</th>
                  <th className="border border-slate-200 px-1 py-1 w-14">교사수</th>
                  <th className="border border-slate-200 px-1 py-1">NEIS과목명</th>
                  <th className="border border-slate-200 px-1 py-1 w-8">삭제</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s, i) => (
                  <tr key={i} className="hover:bg-blue-50">
                    <td className="border border-slate-200 px-1 py-0.5 text-center text-slate-400">{i + 1}</td>
                    <td className="border border-slate-200 px-0.5 py-0.5">
                      <input type="text" value={s.name} onChange={(e) => updateSubject(i, "name", e.target.value)}
                        className="w-full px-1 py-0.5 outline-none border-0 text-center" maxLength={4} />
                    </td>
                    <td className="border border-slate-200 px-0.5 py-0.5">
                      <input type="number" value={s.hours} onChange={(e) => updateSubject(i, "hours", Math.max(1, Number(e.target.value)))}
                        className="w-full px-1 py-0.5 outline-none border-0 text-center" min={1} />
                    </td>
                    <td className="border border-slate-200 px-0.5 py-0.5">
                      <input type="text" value={s.consecutive} onChange={(e) => updateSubject(i, "consecutive", e.target.value)}
                        className="w-full px-1 py-0.5 outline-none border-0 text-center" placeholder="2,1" />
                    </td>
                    <td className="border border-slate-200 px-0.5 py-0.5">
                      <input type="text" value={s.same_group} onChange={(e) => updateSubject(i, "same_group", e.target.value)}
                        className="w-full px-1 py-0.5 outline-none border-0 text-center" />
                    </td>
                    <td className="border border-slate-200 px-0.5 py-0.5">
                      <input type="text" value={s.similar_group} onChange={(e) => updateSubject(i, "similar_group", e.target.value)}
                        className="w-full px-1 py-0.5 outline-none border-0 text-center" />
                    </td>
                    <td className="border border-slate-200 px-0.5 py-0.5">
                      <input type="number" value={s.priority || ""} onChange={(e) => updateSubject(i, "priority", Number(e.target.value))}
                        className="w-full px-1 py-0.5 outline-none border-0 text-center" />
                    </td>
                    <td className="border border-slate-200 px-0.5 py-0.5">
                      <input type="number" value={s.teacher_count} onChange={(e) => updateSubject(i, "teacher_count", Math.max(1, Number(e.target.value)))}
                        className="w-full px-1 py-0.5 outline-none border-0 text-center" min={1} />
                    </td>
                    <td className="border border-slate-200 px-0.5 py-0.5">
                      <input type="text" value={s.neis_name} onChange={(e) => updateSubject(i, "neis_name", e.target.value)}
                        className="w-full px-1 py-0.5 outline-none border-0" />
                    </td>
                    <td className="border border-slate-200 px-0.5 py-0.5 text-center">
                      <button onClick={() => removeSubject(i)} className="hover:text-red-500">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3">
        <button onClick={save} className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-bold hover:bg-blue-600">저장</button>
        {saved && <span className="text-xs text-green-500">저장되었습니다</span>}
      </div>
    </div>
  );
}
