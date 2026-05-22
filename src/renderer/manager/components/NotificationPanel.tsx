import { useState, useEffect } from "react";
import { dbQuery } from "../../creator/hooks/useCreatorDb";

interface ChangeReq { id: string; requester_id: string; type: string; status: string; reason: string; reason_detail: string; created_at: string; }

export function NotificationPanel() {
  const [requests, setRequests] = useState<ChangeReq[]>([]);

  useEffect(() => {
    dbQuery<ChangeReq>("SELECT * FROM change_requests ORDER BY created_at DESC LIMIT 20").then(setRequests);
  }, []);

  return (
    <div className="w-48 bg-white border-l border-slate-200 flex flex-col shrink-0 text-[10px]">
      {/* Changes */}
      <div className="px-2 py-1.5 bg-slate-50 border-b border-slate-200 font-bold text-[11px] text-slate-600">
        변경 알림
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 text-slate-400">변경사항이 없습니다</div>
      </div>

      {/* Requests */}
      <div className="px-2 py-1.5 bg-slate-50 border-y border-slate-200 font-bold text-[11px] text-slate-600 flex justify-between items-center">
        <span>변경 신청</span>
        {requests.length > 0 && (
          <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{requests.length}</span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {requests.length === 0 && <div className="p-2 text-slate-400">신청이 없습니다</div>}
        {requests.map((r) => (
          <div key={r.id} className="px-2 py-1.5 border-b border-slate-100">
            <div className="flex justify-between">
              <span className="font-bold">{r.requester_id}</span>
              <span className={r.status === "pending" ? "text-yellow-500" : r.status === "completed" ? "text-green-500" : "text-slate-400"}>
                {r.status === "pending" ? "대기" : r.status === "completed" ? "완료" : r.status}
              </span>
            </div>
            <div className="text-slate-500">{r.reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
