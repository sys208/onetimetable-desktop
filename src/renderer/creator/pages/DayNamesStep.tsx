import { useState, useEffect } from "react";
import { dbExecute, dbQuery } from "../hooks/useCreatorDb";

const DEFAULT_DAYS = ["월", "화", "수", "목", "금"];

interface DayName {
  id: number;
  day_number: number;
  name: string;
}

export function DayNamesStep() {
  const [days, setDays] = useState<string[]>([...DEFAULT_DAYS]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const rows = await dbQuery<DayName>("SELECT * FROM day_names ORDER BY day_number");
    if (rows.length > 0) {
      setDays(rows.map((r) => r.name));
    }
  }

  async function save() {
    await dbExecute("DELETE FROM day_names");
    for (let i = 0; i < days.length; i++) {
      await dbExecute("INSERT INTO day_names (day_number, name) VALUES (?, ?)", [i + 1, days[i]]);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addDay() {
    if (days.length < 40) setDays([...days, ""]);
  }

  function removeDay() {
    if (days.length > 1) setDays(days.slice(0, -1));
  }

  return (
    <div className="max-w-md">
      <p className="text-xs text-slate-500 mb-4">
        정규수업은 월~금, 보충수업은 날짜(예: 7/25)를 입력합니다. 최대 영문 8자/한글 4자.
        NEIS 일괄파일용은 월,화,수,목,금으로 입력해야 합니다.
      </p>

      <table className="border-collapse text-sm">
        <thead>
          <tr>
            <th className="border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600">수업일</th>
            <th className="border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600">수업일명</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day, i) => (
            <tr key={i}>
              <td className="border border-slate-200 px-3 py-1 text-center text-slate-500">{i + 1} 일</td>
              <td className="border border-slate-200 px-1 py-1">
                <input
                  type="text"
                  value={day}
                  onChange={(e) => {
                    const newDays = [...days];
                    newDays[i] = e.target.value.slice(0, 8);
                    setDays(newDays);
                  }}
                  maxLength={8}
                  className="w-24 px-2 py-0.5 border-0 outline-none text-center"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-2 mt-3">
        <button onClick={addDay} className="px-3 py-1 text-xs bg-slate-200 rounded hover:bg-slate-300">+ 추가</button>
        <button onClick={removeDay} className="px-3 py-1 text-xs bg-slate-200 rounded hover:bg-slate-300">- 삭제</button>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button onClick={save} className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-bold hover:bg-blue-600">
          저장
        </button>
        {saved && <span className="text-xs text-green-500">저장되었습니다</span>}
      </div>
    </div>
  );
}
