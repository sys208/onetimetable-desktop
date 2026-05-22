import { useState, useEffect } from "react";
import { dbExecute, dbQuery } from "../hooks/useCreatorDb";

interface Teacher {
  id: number;
  seq: number;
  name: string;
  note: string;
  meal_period: number | null;
  separator: number;
}

export function TeachersStep() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const rows = await dbQuery<Teacher>("SELECT * FROM teachers ORDER BY seq");
    setTeachers(rows);
  }

  async function save() {
    await dbExecute("DELETE FROM teachers");
    for (const t of teachers) {
      await dbExecute(
        "INSERT INTO teachers (seq, name, note, meal_period, separator) VALUES (?, ?, ?, ?, ?)",
        [t.seq, t.name, t.note, t.meal_period, t.separator]
      );
    }
    await load();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addTeacher() {
    if (teachers.length >= 200) return;
    const seq = teachers.length + 1;
    setTeachers([...teachers, { id: 0, seq, name: "", note: "", meal_period: null, separator: 0 }]);
  }

  function removeTeacher(idx: number) {
    const newList = teachers.filter((_, i) => i !== idx).map((t, i) => ({ ...t, seq: i + 1 }));
    setTeachers(newList);
  }

  function updateTeacher(idx: number, field: keyof Teacher, value: unknown) {
    const newList = [...teachers];
    (newList[idx] as any)[field] = value;
    setTeachers(newList);
  }

  function moveTeacher(idx: number, dir: -1 | 1) {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= teachers.length) return;
    const newList = [...teachers];
    [newList[idx], newList[newIdx]] = [newList[newIdx]!, newList[idx]!];
    newList.forEach((t, i) => (t.seq = i + 1));
    setTeachers(newList);
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      const names = text.split(/[\n\r\t,]+/).map((s) => s.trim()).filter(Boolean);
      if (names.length === 0) return;
      const startSeq = teachers.length + 1;
      const newTeachers = names.map((name, i) => ({
        id: 0, seq: startSeq + i, name, note: "", meal_period: null as number | null, separator: 0,
      }));
      setTeachers([...teachers, ...newTeachers].slice(0, 200));
    } catch { /* clipboard access denied */ }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-sm text-slate-600">입력된 교사수: <strong>{teachers.length}</strong>명 (최대 200)</span>
        <button onClick={addTeacher} className="px-3 py-1 text-xs bg-slate-200 rounded hover:bg-slate-300">+ 추가</button>
        <button onClick={handlePaste} className="px-3 py-1 text-xs bg-slate-200 rounded hover:bg-slate-300">붙이기</button>
      </div>

      <div className="overflow-y-auto max-h-[400px] border border-slate-200 rounded">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0">
            <tr className="bg-slate-50">
              <th className="border border-slate-200 px-2 py-1.5 w-12">순서</th>
              <th className="border border-slate-200 px-2 py-1.5 w-28">교사성명</th>
              <th className="border border-slate-200 px-2 py-1.5">비고</th>
              <th className="border border-slate-200 px-2 py-1.5 w-16">식사시간</th>
              <th className="border border-slate-200 px-2 py-1.5 w-14">구분선</th>
              <th className="border border-slate-200 px-2 py-1.5 w-20">작업</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t, i) => (
              <tr key={i} className="hover:bg-blue-50">
                <td className="border border-slate-200 px-2 py-0.5 text-center text-slate-400">{t.seq}</td>
                <td className="border border-slate-200 px-1 py-0.5">
                  <input
                    type="text"
                    value={t.name}
                    onChange={(e) => updateTeacher(i, "name", e.target.value)}
                    className="w-full px-1 py-0.5 outline-none border-0"
                    placeholder="이름"
                  />
                </td>
                <td className="border border-slate-200 px-1 py-0.5">
                  <input
                    type="text"
                    value={t.note}
                    onChange={(e) => updateTeacher(i, "note", e.target.value)}
                    className="w-full px-1 py-0.5 outline-none border-0"
                    placeholder="직책 등"
                  />
                </td>
                <td className="border border-slate-200 px-1 py-0.5">
                  <input
                    type="number"
                    value={t.meal_period ?? ""}
                    onChange={(e) => updateTeacher(i, "meal_period", e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-1 py-0.5 outline-none border-0 text-center"
                  />
                </td>
                <td className="border border-slate-200 px-1 py-0.5 text-center">
                  <input
                    type="checkbox"
                    checked={t.separator === 1}
                    onChange={(e) => updateTeacher(i, "separator", e.target.checked ? 1 : 0)}
                  />
                </td>
                <td className="border border-slate-200 px-1 py-0.5 text-center">
                  <button onClick={() => moveTeacher(i, -1)} className="px-1 hover:text-blue-500">↑</button>
                  <button onClick={() => moveTeacher(i, 1)} className="px-1 hover:text-blue-500">↓</button>
                  <button onClick={() => removeTeacher(i)} className="px-1 hover:text-red-500">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 mt-3">
        <button onClick={save} className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-bold hover:bg-blue-600">
          저장
        </button>
        {saved && <span className="text-xs text-green-500">저장되었습니다</span>}
      </div>
    </div>
  );
}
