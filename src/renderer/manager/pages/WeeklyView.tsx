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

function getWeekDates(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return Array.from({ length: 5 }, (_, i) => {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    return dd;
  });
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const dayLabels = ["월", "화", "수", "목", "금"];

export function WeeklyView({ date, selectedId, selectorType }: Props) {
  const [rows, setRows] = useState<TimetableRow[]>([]);
  const weekDates = getWeekDates(date);
  const todayStr = formatDate(new Date());
  const maxPeriods = 7;

  useEffect(() => {
    if (!selectedId) return;
    const dateStrs = weekDates.map(formatDate);
    const field = selectorType === "teacher" ? "teacher_id" : selectorType === "class" ? "class_id" : "special_room";
    dbQuery<TimetableRow>(
      `SELECT * FROM timetable WHERE ${field} = ? AND date IN (${dateStrs.map(() => "?").join(",")})`,
      [selectedId, ...dateStrs]
    ).then(setRows);
  }, [selectedId, date, selectorType]);

  function getCell(dateStr: string, period: number): TimetableRow | undefined {
    return rows.find((r) => r.date === dateStr && r.period === period);
  }

  function getCellStyle(cell?: TimetableRow): React.CSSProperties {
    if (!cell) return {};
    if (cell.change_type === "moved") return { backgroundColor: COLORS.changed };
    if (cell.change_type === "substituted") return { backgroundColor: COLORS.substitute };
    if (cell.is_fixed) return { color: COLORS.fixed, fontWeight: "bold" };
    return {};
  }

  function formatCell(cell?: TimetableRow): string {
    if (!cell) return "";
    if (selectorType === "teacher") return `${cell.subject}/${cell.class_id}`;
    if (selectorType === "class") return `${cell.subject}/${cell.teacher_id}`;
    return `${cell.subject}/${cell.class_id}`;
  }

  return (
    <div className="p-3">
      {!selectedId && (
        <div className="flex items-center justify-center h-40 text-sm text-slate-400">
          왼쪽에서 교사/학반/특별실을 선택하세요
        </div>
      )}

      {selectedId && (
        <>
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr>
                <th className="border border-slate-200 bg-slate-50 px-2 py-1.5 w-14 text-slate-600">날짜/교시</th>
                {weekDates.map((d, i) => {
                  const ds = formatDate(d);
                  const isToday = ds === todayStr;
                  return (
                    <th key={i} className={`border border-slate-200 px-2 py-1.5 ${isToday ? "bg-yellow-50 font-bold" : "bg-slate-50"} text-slate-600`}>
                      {d.getMonth() + 1}/{d.getDate()}({dayLabels[i]})
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxPeriods }, (_, p) => p + 1).map((period) => (
                <tr key={period}>
                  <td className="border border-slate-200 bg-slate-50 px-2 py-2 text-center font-bold text-slate-600">{period}</td>
                  {weekDates.map((d, i) => {
                    const ds = formatDate(d);
                    const isToday = ds === todayStr;
                    const cell = getCell(ds, period);
                    return (
                      <td key={i}
                        className={`border border-slate-200 px-2 py-2 text-center cursor-pointer hover:bg-blue-50 transition-colors ${
                          isToday && !cell?.change_type ? "bg-yellow-50/50" : ""
                        }`}
                        style={getCellStyle(cell)}
                        onDoubleClick={() => {/* 수업변경 신청 or 직접변경 */}}>
                        {formatCell(cell)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex gap-4 mt-2 text-[9px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS.changed }} /> 변경
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS.substitute }} /> 보강
            </span>
            <span style={{ color: COLORS.fixed, fontWeight: "bold" }}>빨강 = 고정</span>
            <span className="ml-auto">더블클릭: 수업변경</span>
          </div>
        </>
      )}
    </div>
  );
}
