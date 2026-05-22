import { useState, useEffect } from "react";
import { dbExecute, dbQuery } from "../hooks/useCreatorDb";

interface Department { id: number; grade: number; name: string; class_count: number; start_class: number; }
interface ClassRow { id: number; department_id: number; name: string; meal_period: number | null; homeroom1: string; homeroom2: string; }

export function ClassNamesStep() {
  const [depts, setDepts] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<number | null>(null);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadDepts(); }, []);
  useEffect(() => { if (selectedDept) loadClasses(selectedDept); }, [selectedDept]);

  async function loadDepts() {
    const rows = await dbQuery<Department>("SELECT * FROM departments ORDER BY id");
    setDepts(rows);
    if (rows.length > 0) setSelectedDept(rows[0]!.id);
  }

  async function loadClasses(deptId: number) {
    const rows = await dbQuery<ClassRow>("SELECT * FROM classes WHERE department_id = ? ORDER BY id", [deptId]);
    if (rows.length > 0) {
      setClasses(rows);
    } else {
      const dept = depts.find((d) => d.id === deptId);
      if (!dept) return;
      const generated: ClassRow[] = [];
      for (let i = 0; i < dept.class_count; i++) {
        generated.push({
          id: 0, department_id: deptId,
          name: `${dept.grade}-${dept.start_class + i}`,
          meal_period: null, homeroom1: "", homeroom2: "",
        });
      }
      setClasses(generated);
    }
  }

  async function save() {
    if (!selectedDept) return;
    await dbExecute("DELETE FROM classes WHERE department_id = ?", [selectedDept]);
    for (const c of classes) {
      await dbExecute(
        "INSERT INTO classes (department_id, name, meal_period, homeroom1, homeroom2) VALUES (?, ?, ?, ?, ?)",
        [selectedDept, c.name, c.meal_period, c.homeroom1, c.homeroom2]
      );
    }
    await loadClasses(selectedDept);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updateClass(idx: number, field: keyof ClassRow, value: unknown) {
    const newList = [...classes];
    (newList[idx] as any)[field] = value;
    setClasses(newList);
  }

  return (
    <div>
      <p className="text-xs text-slate-500 mb-3">계열을 선택한 후 학반명, 식사시간, 담임을 입력합니다.</p>

      <div className="flex gap-4">
        <div className="w-36 shrink-0">
          <div className="text-xs font-bold text-slate-500 mb-1">계열</div>
          {depts.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDept(d.id)}
              className={`w-full text-left px-2 py-1 text-xs rounded mb-0.5 ${
                selectedDept === d.id ? "bg-blue-500 text-white" : "hover:bg-slate-100"
              }`}
            >
              {d.grade}학년 {d.name}
            </button>
          ))}
          {depts.length === 0 && <p className="text-xs text-slate-400">계열자료를 먼저 입력하세요</p>}
        </div>

        <div className="flex-1">
          {classes.length > 0 && (
            <table className="border-collapse text-xs w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 px-2 py-1.5 w-12">순서</th>
                  <th className="border border-slate-200 px-2 py-1.5 w-20">학반명</th>
                  <th className="border border-slate-200 px-2 py-1.5 w-16">식사시간</th>
                  <th className="border border-slate-200 px-2 py-1.5">담임1</th>
                  <th className="border border-slate-200 px-2 py-1.5">담임2</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c, i) => (
                  <tr key={i} className="hover:bg-blue-50">
                    <td className="border border-slate-200 px-2 py-0.5 text-center text-slate-400">{i + 1}</td>
                    <td className="border border-slate-200 px-1 py-0.5">
                      <input type="text" value={c.name} onChange={(e) => updateClass(i, "name", e.target.value)}
                        className="w-full px-1 py-0.5 outline-none border-0 text-center" />
                    </td>
                    <td className="border border-slate-200 px-1 py-0.5">
                      <input type="number" value={c.meal_period ?? ""} onChange={(e) => updateClass(i, "meal_period", e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-1 py-0.5 outline-none border-0 text-center" />
                    </td>
                    <td className="border border-slate-200 px-1 py-0.5">
                      <input type="text" value={c.homeroom1} onChange={(e) => updateClass(i, "homeroom1", e.target.value)}
                        className="w-full px-1 py-0.5 outline-none border-0" />
                    </td>
                    <td className="border border-slate-200 px-1 py-0.5">
                      <input type="text" value={c.homeroom2} onChange={(e) => updateClass(i, "homeroom2", e.target.value)}
                        className="w-full px-1 py-0.5 outline-none border-0" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3">
        <button onClick={save} className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-bold hover:bg-blue-600">저장</button>
        {saved && <span className="text-xs text-green-500">저장되었습니다</span>}
      </div>
    </div>
  );
}
