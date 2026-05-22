import { COLORS } from "../../shared/constants";

interface Cell {
  subject: string;
  classId: string;
  teacherName?: string;
  changeType?: "moved" | "substituted" | "cancelled";
  isFixed?: boolean;
}

interface TimetableGridProps {
  days?: string[];
  periods?: number;
  data?: Record<string, Record<number, Cell>>;
  todayIndex?: number;
  onCellClick?: (day: string, period: number) => void;
  onCellDoubleClick?: (day: string, period: number) => void;
}

export function TimetableGrid({
  days = ["월", "화", "수", "목", "금"],
  periods = 7,
  data = {},
  todayIndex,
  onCellClick,
  onCellDoubleClick,
}: TimetableGridProps) {
  const getCellStyle = (cell?: Cell): React.CSSProperties => {
    if (!cell) return {};
    if (cell.changeType === "moved") return { backgroundColor: COLORS.changed };
    if (cell.changeType === "substituted") return { backgroundColor: COLORS.substitute };
    if (cell.isFixed) return { color: COLORS.fixed, fontWeight: "bold" };
    return {};
  };

  const formatCell = (cell?: Cell) => {
    if (!cell) return "";
    const parts = [cell.subject];
    if (cell.classId) parts.push(`/${cell.classId}`);
    return parts.join("");
  };

  return (
    <div>
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr>
            <th className="border border-slate-200 bg-slate-50 px-2 py-1.5 w-10 font-semibold text-slate-600">교시</th>
            {days.map((day, i) => (
              <th
                key={day}
                className={`border border-slate-200 px-2 py-1.5 font-semibold ${
                  i === todayIndex ? "bg-yellow-50 text-slate-800" : "bg-slate-50 text-slate-600"
                }`}
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: periods }, (_, p) => p + 1).map((period) => (
            <tr key={period}>
              <td className="border border-slate-200 bg-slate-50 px-2 py-1.5 text-center font-bold text-slate-600">
                {period}
              </td>
              {days.map((day, i) => {
                const cell = data[day]?.[period];
                return (
                  <td
                    key={day}
                    className={`border border-slate-200 px-2 py-1.5 text-center cursor-pointer hover:bg-blue-50 transition-colors ${
                      i === todayIndex && !cell?.changeType ? "bg-yellow-50/50" : ""
                    }`}
                    style={getCellStyle(cell)}
                    onClick={() => onCellClick?.(day, period)}
                    onDoubleClick={() => onCellDoubleClick?.(day, period)}
                  >
                    {formatCell(cell)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-4 mt-1.5 text-[9px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm border border-slate-200" style={{ backgroundColor: COLORS.changed }} />
          변경
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm border border-slate-200" style={{ backgroundColor: COLORS.substitute }} />
          보강
        </span>
        <span className="flex items-center gap-1">
          <span className="font-bold" style={{ color: COLORS.fixed }}>빨강</span>
          = 고정
        </span>
      </div>
    </div>
  );
}
