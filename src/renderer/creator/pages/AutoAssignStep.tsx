import { useState } from "react";

export function AutoAssignStep() {
  const [method, setMethod] = useState(0);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState("");
  const [maxIterations, setMaxIterations] = useState(200);
  const [level, setLevel] = useState<"low" | "mid" | "high">("mid");

  // 제약조건 옵션
  const [opts, setOpts] = useState({
    maxConsecutive: 4,
    avgPlusMax: 2,
    mealTime: true,
    mealBlock: true,
    similarSameDay: true,
    subjectGroupSep: true,
    priority: true,
    twoHourDaily: true,
    forceNoUnassigned: true,
  });

  function startAssign() {
    setRunning(true);
    setProgress("배정 준비 중...");
    // 실제 알고리즘은 Plan 3에서 Web Worker로 구현
    setTimeout(() => {
      setProgress("자동배정 알고리즘은 다음 업데이트에서 구현됩니다.");
      setRunning(false);
    }, 1000);
  }

  const methods = [
    "수동 배정된 시간을 제외한 모든 시간 처음부터 배정",
    "수동배정, 고정된 시간을 제외한 모든 시간 처음부터 배정",
    "미배정 시간만 배정 (기존 배정된 시간 변경하지 않음)",
    "미배정 시간만 배정 (기존 배정된 시간 변경될 수 있음)",
  ];

  return (
    <div className="max-w-2xl">
      {/* 배정 방법 */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-700 mb-2">(1) 배정방법</h3>
        <div className="space-y-1">
          {methods.map((m, i) => (
            <label key={i} className="flex items-center gap-2 text-xs text-slate-600">
              <input type="radio" name="method" checked={method === i} onChange={() => setMethod(i)} />
              {m}
            </label>
          ))}
        </div>
      </div>

      {/* 엄수조건 */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-700 mb-2">(3) 엄수조건</h3>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={opts.mealTime} onChange={(e) => setOpts({ ...opts, mealTime: e.target.checked })} />
            식사시간 고려 엄수
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={opts.mealBlock} onChange={(e) => setOpts({ ...opts, mealBlock: e.target.checked })} />
            2시간연속수업 식사시간겹침금지
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={opts.similarSameDay} onChange={(e) => setOpts({ ...opts, similarSameDay: e.target.checked })} />
            유사과목 같은날 배정금지
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={opts.subjectGroupSep} onChange={(e) => setOpts({ ...opts, subjectGroupSep: e.target.checked })} />
            수업과목간 구분 엄수
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={opts.priority} onChange={(e) => setOpts({ ...opts, priority: e.target.checked })} />
            순배 엄수
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={opts.twoHourDaily} onChange={(e) => setOpts({ ...opts, twoHourDaily: e.target.checked })} />
            2시수 과목 연일배정금지
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={opts.forceNoUnassigned} onChange={(e) => setOpts({ ...opts, forceNoUnassigned: e.target.checked })} />
            미배정이 없도록 엄수조건 무시 가능
          </label>
          <div className="flex items-center gap-2">
            <span>연속</span>
            <input type="number" value={opts.maxConsecutive} onChange={(e) => setOpts({ ...opts, maxConsecutive: Number(e.target.value) })}
              className="w-10 px-1 py-0.5 border border-slate-300 rounded text-center" min={2} max={9} />
            <span>시간이상 배정금지</span>
          </div>
          <div className="flex items-center gap-2">
            <span>평균시수+</span>
            <input type="number" value={opts.avgPlusMax} onChange={(e) => setOpts({ ...opts, avgPlusMax: Number(e.target.value) })}
              className="w-10 px-1 py-0.5 border border-slate-300 rounded text-center" min={1} max={5} />
            <span>시간이상 배정금지</span>
          </div>
        </div>
      </div>

      {/* 배정 수준 & 횟수 */}
      <div className="flex gap-6 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-2">(4) 배정수준</h3>
          <div className="flex gap-4 text-xs">
            {(["low", "mid", "high"] as const).map((l) => (
              <label key={l} className="flex items-center gap-1">
                <input type="radio" name="level" checked={level === l} onChange={() => setLevel(l)} />
                {l === "low" ? "하" : l === "mid" ? "중" : "상"}
              </label>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-2">배정횟수</h3>
          <input type="number" value={maxIterations} onChange={(e) => setMaxIterations(Number(e.target.value))}
            className="w-20 px-2 py-1 border border-slate-300 rounded text-sm" min={1} max={999} />
        </div>
      </div>

      {/* 실행 */}
      <div className="flex items-center gap-3">
        <button onClick={startAssign} disabled={running}
          className="px-6 py-2 bg-red-500 text-white rounded text-sm font-bold hover:bg-red-600 disabled:opacity-50">
          {running ? "배정 중..." : "배정 (B)"}
        </button>
        {running && (
          <button onClick={() => setRunning(false)} className="px-4 py-2 bg-slate-500 text-white rounded text-sm">
            배정취소
          </button>
        )}
      </div>

      {progress && (
        <div className="mt-3 p-3 bg-slate-100 rounded text-xs text-slate-600">
          {progress}
        </div>
      )}
    </div>
  );
}
