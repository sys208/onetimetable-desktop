import { useState, useEffect } from "react";
import { dbQuery } from "../../creator/hooks/useCreatorDb";
import { COLORS } from "../../../shared/constants";

interface TimetableRow {
  id: number; date: string; period: number; class_id: string;
  subject: string; teacher_id: string; special_room: string | null;
  is_fixed: number; change_type: string | null;
}

interface Props {
  date: Date;
  selectedId: string | null;
  selectorType: "teacher" | "class" | "room";
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function DailyView({ date, selectedId, selectorType }: Props) {
  const [rows, setRows] = useState<TimetableRow[]>([]);
  const [changesOnly, setChangesOnly] = useState(false);
  const dateStr = formatDate(date);
  const maxPeriods = 7;

  useEffect(() => {
    if (!selectedId) return;
    const field = selectorType === "teacher" ? "teacher_id" : selectorType === "class" ? "class_id" : "special_room";
    dbQuery<TimetableRow>(
      `SELECT * FROM timetable WHERE ${field} = ? AND date = ? ORDER BY period`,
      [selectedId, dateStr]
    ).then(setRows);
  }, [selectedId, date, selectorType]);

  const displayRows = changesOnly ? rows.filter((r) => r.change_type) : rows;

  return (
    <div className="p-3">
      {!selectedId && (
        <div className="flex items-center justify-center h-40 text-sm text-slate-400">
          왼쪽에서 교사/학반/특별실을 선택하세요
        </div>
      )}

      {selectedId && (
        <>
          <div className="flex items-center gap-3 mb-2">
            <label className="flex items-center gap-1 text-xs text-slate-500">
              <input type="checkbox" checked={changesOnly} onChange={(e) => setChangesOnly(e.target.checked)} />
              변경만 보이기
            </label>
          </div>

          <table className="w-full border-collapse text-xs max-w-md">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-200 px-3 py-1.5 w-14">교시</th>
                <th className="border border-slate-200 px-3 py-1.5">과목</th>
                <th className="border border-slate-200 px-3 py-1.5">{selectorType === "teacher" ? "학반" : "교사"}</th>
                <th className="border border-slate-200 px-3 py-1.5">특별실</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxPeriods }, (_, p) => p + 1).map((period) => {
                const cell = displayRows.find((r) => r.period === period);
                if (changesOnly && !cell) return null;

                const style: React.CSSProperties = {};
                if (cell?.change_type === "moved") style.backgroundColor = COLORS.changed;
                if (cell?.change_type === "substituted") style.backgroundColor = COLORS.substitute;
                if (cell?.is_fixed) style.color = COLORS.fixed;

                return (
                  <tr key={period} style={style}>
                    <td className="border border-slate-200 px-3 py-2 text-center font-bold">{period}</td>
                    <td className="border border-slate-200 px-3 py-2">{cell?.subject || ""}</td>
                    <td className="border border-slate-200 px-3 py-2">{selectorType === "teacher" ? cell?.class_id : cell?.teacher_id || ""}</td>
                    <td className="border border-slate-200 px-3 py-2">{cell?.special_room || ""}</td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={4} className="border border-slate-200 px-3 py-4 text-center text-slate-400">시간표 데이터가 없습니다</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
