import { useState, useEffect } from "react";
import { dbExecute, dbQuery } from "../hooks/useCreatorDb";

interface SpecialRoom { id: number; name: string; note: string; }

export function SpecialRoomsStep() {
  const [rooms, setRooms] = useState<SpecialRoom[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const rows = await dbQuery<SpecialRoom>("SELECT * FROM special_rooms ORDER BY id");
    setRooms(rows);
  }

  async function save() {
    await dbExecute("DELETE FROM special_rooms");
    for (const r of rooms) {
      await dbExecute("INSERT INTO special_rooms (name, note) VALUES (?, ?)", [r.name, r.note]);
    }
    await load();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addRoom() {
    if (rooms.length >= 90) return;
    setRooms([...rooms, { id: 0, name: "", note: "" }]);
  }

  function removeRoom(idx: number) {
    setRooms(rooms.filter((_, i) => i !== idx));
  }

  function updateRoom(idx: number, field: keyof SpecialRoom, value: string) {
    const newList = [...rooms];
    (newList[idx] as any)[field] = value;
    setRooms(newList);
  }

  return (
    <div className="max-w-lg">
      <p className="text-xs text-slate-500 mb-3">
        교과교실, 실습실, 운동장, 체육관 등을 입력합니다.
        운동장처럼 여러 학급이 사용 가능하면 수용 학급수만큼 나눠 입력합니다. 최대 90실.
      </p>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-sm text-slate-600">입력된 특별실수: <strong>{rooms.length}</strong> (최대 90)</span>
        <button onClick={addRoom} className="px-3 py-1 text-xs bg-slate-200 rounded hover:bg-slate-300">+ 추가</button>
      </div>

      <div className="overflow-y-auto max-h-[400px] border border-slate-200 rounded">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0">
            <tr className="bg-slate-50">
              <th className="border border-slate-200 px-2 py-1.5 w-12">번호</th>
              <th className="border border-slate-200 px-2 py-1.5">특별실명</th>
              <th className="border border-slate-200 px-2 py-1.5">비고</th>
              <th className="border border-slate-200 px-2 py-1.5 w-12">삭제</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r, i) => (
              <tr key={i} className="hover:bg-blue-50">
                <td className="border border-slate-200 px-2 py-0.5 text-center text-slate-400">{i + 1}</td>
                <td className="border border-slate-200 px-1 py-0.5">
                  <input type="text" value={r.name} onChange={(e) => updateRoom(i, "name", e.target.value)}
                    className="w-full px-1 py-0.5 outline-none border-0" placeholder="과학1실" />
                </td>
                <td className="border border-slate-200 px-1 py-0.5">
                  <input type="text" value={r.note} onChange={(e) => updateRoom(i, "note", e.target.value)}
                    className="w-full px-1 py-0.5 outline-none border-0" />
                </td>
                <td className="border border-slate-200 px-1 py-0.5 text-center">
                  <button onClick={() => removeRoom(i)} className="hover:text-red-500">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 mt-3">
        <button onClick={save} className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-bold hover:bg-blue-600">저장</button>
        {saved && <span className="text-xs text-green-500">저장되었습니다</span>}
      </div>
    </div>
  );
}
