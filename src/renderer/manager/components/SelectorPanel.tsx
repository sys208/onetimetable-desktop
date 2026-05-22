import { useState, useEffect } from "react";
import { dbQuery } from "../../creator/hooks/useCreatorDb";

interface Teacher { id: number; seq: number; name: string; note: string; }
interface ClassRow { id: number; name: string; }
interface Room { id: number; name: string; }

type SelectorType = "teacher" | "class" | "room";

interface Props {
  type: SelectorType;
  onTypeChange: (t: SelectorType) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function SelectorPanel({ type, onTypeChange, selectedId, onSelect }: Props) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    dbQuery<Teacher>("SELECT id, seq, name, note FROM teachers ORDER BY seq").then(setTeachers);
    dbQuery<ClassRow>("SELECT id, name FROM classes ORDER BY id").then(setClasses);
    dbQuery<Room>("SELECT id, name FROM special_rooms ORDER BY id").then(setRooms);
  }, []);

  const items = type === "teacher"
    ? teachers.map((t) => ({ id: String(t.id), label: `${t.seq} ${t.name}`, hasNote: !!t.note }))
    : type === "class"
    ? classes.map((c) => ({ id: String(c.id), label: c.name, hasNote: false }))
    : rooms.map((r) => ({ id: String(r.id), label: r.name, hasNote: false }));

  return (
    <div className="w-32 bg-white border-r border-slate-200 flex flex-col shrink-0">
      {/* Type tabs */}
      <div className="flex border-b border-slate-200">
        {(["teacher", "class", "room"] as SelectorType[]).map((t) => (
          <button key={t} onClick={() => onTypeChange(t)}
            className={`flex-1 py-1.5 text-[10px] text-center ${
              type === t ? "bg-blue-50 text-blue-600 font-bold border-b-2 border-blue-500" : "text-slate-500"
            }`}>
            {t === "teacher" ? "교사" : t === "class" ? "학반" : "특별실"}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {items.map((item) => (
          <button key={item.id} onClick={() => onSelect(item.id)}
            className={`w-full text-left px-2 py-1 text-[11px] ${
              selectedId === item.id ? "bg-blue-500 text-white" : "hover:bg-slate-50"
            }`}>
            {item.label}{item.hasNote ? "*" : ""}
          </button>
        ))}
        {items.length === 0 && <p className="text-[10px] text-slate-400 p-2">데이터 없음</p>}
      </div>
    </div>
  );
}
