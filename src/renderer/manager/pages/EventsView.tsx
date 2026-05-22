import { useState, useEffect } from "react";
import { dbExecute, dbQuery } from "../../creator/hooks/useCreatorDb";

interface SchoolEvent {
  id: number; name: string; type: string; start_date: string; end_date: string; grades: string;
}

export function EventsView() {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "event", start_date: "", end_date: "", grades: "[]" });

  useEffect(() => { load(); }, []);

  async function load() {
    const rows = await dbQuery<SchoolEvent>("SELECT * FROM events ORDER BY start_date DESC");
    setEvents(rows);
  }

  async function submit() {
    await dbExecute(
      "INSERT INTO events (name, type, start_date, end_date, grades) VALUES (?, ?, ?, ?, ?)",
      [form.name, form.type, form.start_date, form.end_date || form.start_date, form.grades]
    );
    setShowForm(false);
    setForm({ name: "", type: "event", start_date: "", end_date: "", grades: "[]" });
    await load();
  }

  async function deleteEvent(id: number) {
    await dbExecute("DELETE FROM events WHERE id = ?", [id]);
    await load();
  }

  const typeLabels: Record<string, string> = { exam: "고사", event: "행사", vacation: "휴가", holiday: "공휴일" };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm text-slate-800">학사/행사 일정</h3>
        <button onClick={() => setShowForm(!showForm)}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded">+ 등록</button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4 space-y-3">
          <div className="grid grid-cols-[100px_1fr] gap-2 items-center text-xs">
            <label className="font-semibold text-slate-600">행사명</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-2 py-1.5 border border-slate-300 rounded" placeholder="중간고사" />

            <label className="font-semibold text-slate-600">종류</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="px-2 py-1.5 border border-slate-300 rounded">
              <option value="exam">고사(시험)</option>
              <option value="event">행사(교과수업변형)</option>
              <option value="vacation">휴가(방학)</option>
              <option value="holiday">공휴일/수업</option>
            </select>

            <label className="font-semibold text-slate-600">시작일</label>
            <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="px-2 py-1.5 border border-slate-300 rounded" />

            <label className="font-semibold text-slate-600">종료일</label>
            <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className="px-2 py-1.5 border border-slate-300 rounded" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs bg-slate-200 rounded">취소</button>
            <button onClick={submit} disabled={!form.name || !form.start_date}
              className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded disabled:opacity-50">등록</button>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {events.map((e) => (
          <div key={e.id} className="flex items-center justify-between bg-white border border-slate-200 rounded px-3 py-2 text-xs">
            <div className="flex items-center gap-3">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                e.type === "exam" ? "bg-red-100 text-red-600" : e.type === "vacation" ? "bg-blue-100 text-blue-600"
                : e.type === "holiday" ? "bg-purple-100 text-purple-600" : "bg-yellow-100 text-yellow-600"
              }`}>{typeLabels[e.type] || e.type}</span>
              <span className="font-semibold">{e.name}</span>
              <span className="text-slate-400">{e.start_date}{e.end_date !== e.start_date ? ` ~ ${e.end_date}` : ""}</span>
            </div>
            <button onClick={() => deleteEvent(e.id)} className="text-slate-400 hover:text-red-500">✕</button>
          </div>
        ))}
        {events.length === 0 && <p className="text-xs text-slate-400 py-4 text-center">등록된 일정이 없습니다</p>}
      </div>
    </div>
  );
}
