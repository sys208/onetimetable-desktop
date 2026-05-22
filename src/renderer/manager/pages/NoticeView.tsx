import { useState, useEffect } from "react";
import { dbExecute, dbQuery } from "../../creator/hooks/useCreatorDb";
import { useAuthStore } from "../../stores/authStore";

interface Notice {
  id: string; school_id: string; class_id: string; teacher_id: string;
  title: string; content: string; image_urls: string; target_period: number | null; created_at: string;
}

export function NoticeView() {
  const { user } = useAuthStore();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", classId: "", targetPeriod: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    const rows = await dbQuery<Notice>("SELECT * FROM class_notices ORDER BY created_at DESC");
    setNotices(rows);
  }

  async function submit() {
    if (!user) return;
    const id = `notice-${Date.now()}`;
    await dbExecute(
      `INSERT INTO class_notices (id, school_id, class_id, teacher_id, title, content, image_urls, target_period, created_at)
       VALUES (?, ?, ?, ?, ?, ?, '[]', ?, datetime('now'))`,
      [id, user.schoolId || "", form.classId, user.id, form.title, form.content, form.targetPeriod ? Number(form.targetPeriod) : null]
    );
    setShowForm(false);
    setForm({ title: "", content: "", classId: "", targetPeriod: "" });
    await load();
  }

  async function deleteNotice(id: string) {
    await dbExecute("DELETE FROM class_notices WHERE id = ?", [id]);
    await load();
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm text-slate-800">학급 공지</h3>
        <button onClick={() => setShowForm(!showForm)}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded">+ 새 공지</button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4 space-y-3">
          <div className="grid grid-cols-[100px_1fr] gap-2 items-start text-xs">
            <label className="font-semibold text-slate-600 pt-1">학급</label>
            <input type="text" value={form.classId}
              onChange={(e) => setForm({ ...form, classId: e.target.value })}
              className="px-2 py-1.5 border border-slate-300 rounded" placeholder="1-3" />

            <label className="font-semibold text-slate-600 pt-1">제목</label>
            <input type="text" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="px-2 py-1.5 border border-slate-300 rounded" placeholder="내일 수행평가 안내" />

            <label className="font-semibold text-slate-600 pt-1">교시 지정</label>
            <input type="number" value={form.targetPeriod}
              onChange={(e) => setForm({ ...form, targetPeriod: e.target.value })}
              className="px-2 py-1.5 border border-slate-300 rounded w-20" placeholder="선택" min={1} max={9} />

            <label className="font-semibold text-slate-600 pt-1">내용</label>
            <textarea value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="px-2 py-1.5 border border-slate-300 rounded h-24 resize-y"
              placeholder="마크다운 지원 (# 제목, **굵게**, - 목록 등)" />
          </div>
          <p className="text-[10px] text-slate-400">마크다운 형식을 지원합니다. 이미지 첨부는 추후 업데이트.</p>

          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs bg-slate-200 rounded">취소</button>
            <button onClick={submit} disabled={!form.title || !form.classId}
              className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded disabled:opacity-50">등록</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {notices.map((n) => (
          <div key={n.id} className="bg-white border border-slate-200 rounded-lg p-3">
            <div className="flex justify-between items-start mb-1">
              <div>
                <span className="text-xs font-bold text-slate-800">{n.title}</span>
                <span className="ml-2 text-[10px] text-slate-400">
                  {n.class_id} | {n.target_period ? `${n.target_period}교시` : "전체"} | {n.created_at}
                </span>
              </div>
              <button onClick={() => deleteNotice(n.id)} className="text-slate-400 hover:text-red-500 text-xs">✕</button>
            </div>
            <p className="text-xs text-slate-600 whitespace-pre-wrap">{n.content}</p>
          </div>
        ))}
        {notices.length === 0 && <p className="text-xs text-slate-400 py-4 text-center">등록된 공지가 없습니다</p>}
      </div>
    </div>
  );
}
