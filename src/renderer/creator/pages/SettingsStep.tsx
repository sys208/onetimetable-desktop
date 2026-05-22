import { useState, useEffect } from "react";
import { dbExecute, dbQuery } from "../hooks/useCreatorDb";

interface Settings {
  id: number;
  title: string;
  school_year: number;
  school_name: string;
  base_days: number;
  max_periods_per_day: number;
  meal_after_period: number;
  memo: string;
  period_names: string;
  legacy_mode: number;
}

export function SettingsStep() {
  const [form, setForm] = useState<Settings>({
    id: 1,
    title: "",
    school_year: new Date().getFullYear(),
    school_name: "",
    base_days: 5,
    max_periods_per_day: 7,
    meal_after_period: 4,
    memo: "",
    period_names: "1,2,3,4,5,6,7,8,9",
    legacy_mode: 0,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const rows = await dbQuery<Settings>("SELECT * FROM settings WHERE id = 1");
    if (rows.length > 0) {
      setForm(rows[0]!);
    }
  }

  async function save() {
    await dbExecute("DELETE FROM settings");
    await dbExecute(
      `INSERT INTO settings (id, title, school_year, school_name, base_days, max_periods_per_day, meal_after_period, memo, period_names, legacy_mode)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [form.title, form.school_year, form.school_name, form.base_days, form.max_periods_per_day, form.meal_after_period, form.memo, form.period_names, form.legacy_mode]
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const periodNames = form.period_names.split(",");

  return (
    <div className="max-w-xl space-y-4">
      <Field label="(1) 시간표 제목">
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="2026 학년도 시간표"
          className="input-field"
        />
      </Field>

      <Field label="(2) 학년도">
        <input
          type="number"
          value={form.school_year}
          onChange={(e) => setForm({ ...form, school_year: Number(e.target.value) })}
          className="input-field w-24"
        />
      </Field>

      <Field label="(3) 학교명">
        <input
          type="text"
          value={form.school_name}
          onChange={(e) => setForm({ ...form, school_name: e.target.value })}
          className="input-field"
        />
      </Field>

      <Field label="(4) 작성기준일수">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={form.base_days}
            onChange={(e) => setForm({ ...form, base_days: Math.min(40, Math.max(1, Number(e.target.value))) })}
            className="input-field w-20"
            min={1}
            max={40}
          />
          <span className="text-xs text-slate-400">일 (최대 40)</span>
        </div>
      </Field>

      <Field label="(5) 일일최대시간수">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={form.max_periods_per_day}
            onChange={(e) => setForm({ ...form, max_periods_per_day: Math.min(10, Math.max(1, Number(e.target.value))) })}
            className="input-field w-20"
            min={1}
            max={10}
          />
          <span className="text-xs text-slate-400">시간</span>
        </div>
      </Field>

      <Field label="(6) 식사시간">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={form.meal_after_period}
            onChange={(e) => setForm({ ...form, meal_after_period: Number(e.target.value) })}
            className="input-field w-20"
          />
          <span className="text-xs text-slate-400">번째 교시 후</span>
        </div>
      </Field>

      <Field label="(7) 메모사항">
        <input
          type="text"
          value={form.memo}
          onChange={(e) => setForm({ ...form, memo: e.target.value })}
          placeholder="인쇄시 좌측하단에 표시"
          className="input-field"
        />
      </Field>

      <Field label="(8) 인쇄시 교시명">
        <div className="flex gap-1">
          {periodNames.map((name, i) => (
            <input
              key={i}
              type="text"
              value={name}
              onChange={(e) => {
                const newNames = [...periodNames];
                newNames[i] = e.target.value;
                setForm({ ...form, period_names: newNames.join(",") });
              }}
              className="w-9 h-9 text-center border border-slate-300 rounded text-sm focus:border-blue-500 outline-none"
            />
          ))}
        </div>
      </Field>

      <Field label="(9) 구버전모드">
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <input
            type="checkbox"
            checked={form.legacy_mode === 1}
            onChange={(e) => setForm({ ...form, legacy_mode: e.target.checked ? 1 : 0 })}
          />
          공강허용안함, 과목시수체크, 미입력과목학반체크
        </label>
      </Field>

      <div className="flex items-center gap-3 pt-2">
        <button onClick={save} className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-bold hover:bg-blue-600">
          저장
        </button>
        {saved && <span className="text-xs text-green-500">저장되었습니다</span>}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 items-center">
      <label className="text-sm font-semibold text-slate-600">{label}</label>
      {children}
    </div>
  );
}
