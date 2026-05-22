import { useState, useEffect } from "react";
import { dbExecute, dbQuery } from "../../creator/hooks/useCreatorDb";
import { useAuthStore } from "../../stores/authStore";

interface ChangeReq {
  id: string; requester_id: string; type: string; status: string;
  reason: string; reason_detail: string; approvals: string;
  before_data: string; after_data: string; created_at: string; processed_at: string | null;
}

export function ChangeRequestsView() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<ChangeReq[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "swap", reason: "", reasonDetail: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    const rows = await dbQuery<ChangeReq>("SELECT * FROM change_requests ORDER BY created_at DESC");
    setRequests(rows);
  }

  async function submit() {
    if (!user) return;
    const id = `req-${Date.now()}`;
    await dbExecute(
      `INSERT INTO change_requests (id, requester_id, type, status, reason, reason_detail, approvals, before_data, after_data, created_at)
       VALUES (?, ?, ?, 'pending', ?, ?, '[]', '{}', '{}', datetime('now'))`,
      [id, user.id, form.type, form.reason, form.reasonDetail]
    );
    setShowForm(false);
    setForm({ type: "swap", reason: "", reasonDetail: "" });
    await load();
  }

  async function updateStatus(id: string, status: string) {
    await dbExecute("UPDATE change_requests SET status = ?, processed_at = datetime('now') WHERE id = ?", [status, id]);
    await load();
  }

  const isAdmin = user?.role === "admin";

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm text-slate-800">수업변경 신청</h3>
        <button onClick={() => setShowForm(!showForm)}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
          + 새 신청
        </button>
      </div>

      {/* 신청 폼 */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4 space-y-3">
          <div className="grid grid-cols-[100px_1fr] gap-2 items-center text-xs">
            <label className="font-semibold text-slate-600">변경 유형</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="px-2 py-1.5 border border-slate-300 rounded text-xs">
              <option value="swap">수업이동(교환)</option>
              <option value="substitute">보강/대체</option>
              <option value="cancel">결강</option>
            </select>

            <label className="font-semibold text-slate-600">사유 종류</label>
            <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="px-2 py-1.5 border border-slate-300 rounded text-xs">
              <option value="">선택</option>
              <option value="출장">출장</option>
              <option value="연수">연수</option>
              <option value="조퇴">조퇴</option>
              <option value="병가">병가</option>
              <option value="공가">공가</option>
              <option value="기타">기타</option>
            </select>

            <label className="font-semibold text-slate-600">상세 내용</label>
            <input type="text" value={form.reasonDetail}
              onChange={(e) => setForm({ ...form, reasonDetail: e.target.value })}
              className="px-2 py-1.5 border border-slate-300 rounded text-xs"
              placeholder="전국체전참가 등" />
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs bg-slate-200 rounded">취소</button>
            <button onClick={submit} disabled={!form.reason}
              className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded disabled:opacity-50">신청</button>
          </div>
        </div>
      )}

      {/* 신청 목록 */}
      <div className="border border-slate-200 rounded overflow-hidden">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50">
              <th className="border-b border-slate-200 px-3 py-2 text-left">신청일시</th>
              <th className="border-b border-slate-200 px-3 py-2 text-left">신청교사</th>
              <th className="border-b border-slate-200 px-3 py-2 text-left">유형</th>
              <th className="border-b border-slate-200 px-3 py-2 text-left">사유</th>
              <th className="border-b border-slate-200 px-3 py-2 text-left">상태</th>
              {isAdmin && <th className="border-b border-slate-200 px-3 py-2 text-left">처리</th>}
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="border-b border-slate-100 px-3 py-2">{r.created_at}</td>
                <td className="border-b border-slate-100 px-3 py-2">{r.requester_id}</td>
                <td className="border-b border-slate-100 px-3 py-2">
                  {r.type === "swap" ? "교환" : r.type === "substitute" ? "보강" : "결강"}
                </td>
                <td className="border-b border-slate-100 px-3 py-2">{r.reason} {r.reason_detail && `(${r.reason_detail})`}</td>
                <td className="border-b border-slate-100 px-3 py-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    r.status === "pending" ? "bg-yellow-100 text-yellow-700"
                    : r.status === "approved" || r.status === "completed" ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                  }`}>
                    {r.status === "pending" ? "대기" : r.status === "approved" ? "승인" : r.status === "completed" ? "완료" : "반려"}
                  </span>
                </td>
                {isAdmin && (
                  <td className="border-b border-slate-100 px-3 py-2">
                    {r.status === "pending" && (
                      <div className="flex gap-1">
                        <button onClick={() => updateStatus(r.id, "completed")} className="px-2 py-0.5 bg-green-500 text-white rounded text-[10px]">승인</button>
                        <button onClick={() => updateStatus(r.id, "rejected")} className="px-2 py-0.5 bg-red-500 text-white rounded text-[10px]">반려</button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {requests.length === 0 && (
              <tr><td colSpan={isAdmin ? 6 : 5} className="px-3 py-8 text-center text-slate-400">신청 내역이 없습니다</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
