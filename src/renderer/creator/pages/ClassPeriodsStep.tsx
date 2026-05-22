import { useState, useEffect } from "react";
import { dbExecute, dbQuery } from "../hooks/useCreatorDb";

interface Department { id: number; grade: number; name: string; }
interface PeriodRow { id: number; department_id: number; period: number; mon: string; tue: string; wed: string; thu: string; fri: string; }
interface Settings { max_periods_per_day: number; }

export function ClassPeriodsStep() {
  const [depts, setDepts] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<number | null>(null);
  const [periods, setPeriods] = useState<PeriodRow[]>([]);
  const [maxPeriods, setMaxPeriods] = useState(7);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadDepts(); loadSettings(); }, []);
  useEffect(() => { if (selectedDept) loadPeriods(selectedDept); }, [selectedDept, maxPeriods]);

  async function loadSettings() {
    const rows = await dbQuery<Settings>("SELECT max_periods_per_day FROM settings WHERE id = 1");
    if (rows.length > 0) setMaxPeriods(rows[0]!.max_periods_per_day);
  }

  async function loadDepts() {
    const rows = await dbQuery<Department>("SELECT id, grade, name FROM departments ORDER BY id");
    setDepts(rows);
    if (rows.length > 0) setSelectedDept(rows[0]!.id);
  }

  async function loadPeriods(deptId: number) {
    const rows = await dbQuery<PeriodRow>("SELECT * FROM class_periods WHERE department_id = ? ORDER BY period", [deptId]);
    if (rows.length > 0) {
      setPeriods(rows);
    } else {
      const generated: PeriodRow[] = [];
      for (let i = 1; i <= maxPeriods; i++) {
        generated.push({ id: 0, department_id: deptId, period: i, mon: "", tue: "", wed: "", thu: "", fri: "" });
      }
      setPeriods(generated);
    }
  }

  async function save() {
    if (!selectedDept) return;
    await dbExecute("DELETE FROM class_periods WHERE department_id = ?", [selectedDept]);
    for (const p of periods) {
      await dbExecute(
        "INSERT INTO class_periods (department_id, period, mon, tue, wed, thu, fri) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [selectedDept, p.period, p.mon, p.tue, p.wed, p.thu, p.fri]
      );
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updatePeriod(idx: number, day: string, value: string) {
    const newList = [...periods];
    (newList[idx] as any)[day] = value;
    setPeriods(newList);
  }

  const days = ["mon", "tue", "wed", "thu", "fri"];
  const dayLabels = ["월", "화", "수", "목", "금"];

  return (
    <div>
      <p className="text-xs text-slate-500 mb-3">
        수업시간은 공란(블록타임 숫자) 또는 X(수업없음)를 입력합니다.
        숫자를 입력하면 해당 연속수업이 우선 배정됩니다.
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

        <div className="flex-1">
          {periods.length > 0 && (
            <table className="border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 px-2 py-1.5 w-12">시간</th>
                  {dayLabels.map((d) => (
                    <th key={d} className="border border-slate-200 px-2 py-1.5 w-16">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((p, i) => (
                  <tr key={i} className="hover:bg-blue-50">
                    <td className="border border-slate-200 px-2 py-0.5 text-center font-bold text-slate-500">{p.period}</td>
                    {days.map((day) => (
                      <td key={day} className="border border-slate-200 px-1 py-0.5">
                        <input
                          type="text"
                          value={(p as any)[day]}
                          onChange={(e) => updatePeriod(i, day, e.target.value)}
                          className="w-full px-1 py-0.5 outline-none border-0 text-center uppercase"
                          maxLength={8}
                        />
                      </td>
                    ))}
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
