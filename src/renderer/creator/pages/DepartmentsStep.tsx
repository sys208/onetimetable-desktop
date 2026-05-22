import { useState, useEffect } from "react";
import { dbExecute, dbQuery } from "../hooks/useCreatorDb";

interface Department {
  id: number;
  grade: number;
  name: string;
  class_count: number;
  start_class: number;
}

export function DepartmentsStep() {
  const [depts, setDepts] = useState<Department[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const rows = await dbQuery<Department>("SELECT * FROM departments ORDER BY id");
    setDepts(rows);
  }

  async function save() {
    await dbExecute("DELETE FROM departments");
    for (const d of depts) {
      await dbExecute(
        "INSERT INTO departments (grade, name, class_count, start_class) VALUES (?, ?, ?, ?)",
        [d.grade, d.name, d.class_count, d.start_class]
      );
    }
    await load();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addDept() {
    if (depts.length >= 16) return;
    const grade = depts.length > 0 ? Math.max(...depts.map((d) => d.grade)) + 1 : 1;
    setDepts([...depts, { id: 0, grade, name: "", class_count: 1, start_class: 1 }]);
  }

  function removeDept(idx: number) {
    setDepts(depts.filter((_, i) => i !== idx));
  }

  function updateDept(idx: number, field: keyof Department, value: unknown) {
    const newList = [...depts];
    (newList[idx] as any)[field] = value;
    setDepts(newList);
  }

  const totalClasses = depts.reduce((sum, d) => sum + d.class_count, 0);

  return (
    <div className="max-w-xl">
      <p className="text-xs text-slate-500 mb-3">
        계열이란 같은 교육과정으로 수업하는 학급들의 집단입니다.
        중학교나 일반고는 계열명을 입력하지 않습니다. 학반수는 실제학반수+추가학반수를 입력합니다.
      </p>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-sm text-slate-600">
          입력된 계열수: <strong>{depts.length}</strong> (최대 16) | 총학반: <strong>{totalClasses}</strong>
        </span>
        <button onClick={addDept} className="px-3 py-1 text-xs bg-slate-200 rounded hover:bg-slate-300">+ 추가</button>
      </div>

      <table className="border-collapse text-xs w-full">
        <thead>
          <tr className="bg-slate-50">
            <th className="border border-slate-200 px-2 py-1.5 w-12">순서</th>
            <th className="border border-slate-200 px-2 py-1.5 w-16">학년</th>
            <th className="border border-slate-200 px-2 py-1.5">계열명</th>
            <th className="border border-slate-200 px-2 py-1.5 w-16">학반수</th>
            <th className="border border-slate-200 px-2 py-1.5 w-20">시작학반</th>
            <th className="border border-slate-200 px-2 py-1.5 w-12">삭제</th>
          </tr>
        </thead>
        <tbody>
          {depts.map((d, i) => (
            <tr key={i} className="hover:bg-blue-50">
              <td className="border border-slate-200 px-2 py-0.5 text-center text-slate-400">{i + 1}</td>
              <td className="border border-slate-200 px-1 py-0.5">
                <input
                  type="number"
                  value={d.grade}
                  onChange={(e) => updateDept(i, "grade", Math.min(16, Math.max(1, Number(e.target.value))))}
                  className="w-full px-1 py-0.5 outline-none border-0 text-center"
                  min={1} max={16}
                />
              </td>
              <td className="border border-slate-200 px-1 py-0.5">
                <input
                  type="text"
                  value={d.name}
                  onChange={(e) => updateDept(i, "name", e.target.value)}
                  className="w-full px-1 py-0.5 outline-none border-0"
                  placeholder="특성화고만 입력"
                />
              </td>
              <td className="border border-slate-200 px-1 py-0.5">
                <input
                  type="number"
                  value={d.class_count}
                  onChange={(e) => updateDept(i, "class_count", Math.max(1, Number(e.target.value)))}
                  className="w-full px-1 py-0.5 outline-none border-0 text-center"
                  min={1}
                />
              </td>
              <td className="border border-slate-200 px-1 py-0.5">
                <input
                  type="number"
                  value={d.start_class}
                  onChange={(e) => updateDept(i, "start_class", Math.max(1, Number(e.target.value)))}
                  className="w-full px-1 py-0.5 outline-none border-0 text-center"
                  min={1}
                />
              </td>
              <td className="border border-slate-200 px-1 py-0.5 text-center">
                <button onClick={() => removeDept(i)} className="hover:text-red-500">✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center gap-3 mt-3">
        <button onClick={save} className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-bold hover:bg-blue-600">저장</button>
        {saved && <span className="text-xs text-green-500">저장되었습니다</span>}
      </div>
    </div>
  );
}
