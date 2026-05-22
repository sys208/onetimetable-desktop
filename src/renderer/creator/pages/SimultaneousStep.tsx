import { useState, useEffect } from "react";
import { dbExecute, dbQuery } from "../hooks/useCreatorDb";

interface Department { id: number; grade: number; name: string; }
interface Subject { id: number; department_id: number; name: string; }
interface ClassRow { id: number; department_id: number; name: string; }
interface SimGroup { id: number; group_number: number; class_entries: string; }

interface Entry { subjectName: string; classNames: string[]; }

export function SimultaneousStep() {
  const [depts, setDepts] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [groups, setGroups] = useState<SimGroup[]>([]);
  const [selDept, setSelDept] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadDepts(); loadGroups(); }, []);
  useEffect(() => {
    if (selDept) {
      dbQuery<Subject>("SELECT id, department_id, name FROM subjects WHERE department_id = ?", [selDept]).then(setSubjects);
      dbQuery<ClassRow>("SELECT id, department_id, name FROM classes WHERE department_id = ?", [selDept]).then(setClasses);
    }
  }, [selDept]);

  async function loadDepts() {
    const d = await dbQuery<Department>("SELECT id, grade, name FROM departments ORDER BY id");
    setDepts(d);
    if (d.length > 0) setSelDept(d[0]!.id);
  }

  async function loadGroups() {
    const rows = await dbQuery<SimGroup>("SELECT * FROM simultaneous_classes ORDER BY group_number");
    setGroups(rows);
  }

  async function addGroup() {
    const num = groups.length + 1;
    await dbExecute("INSERT INTO simultaneous_classes (group_number, class_entries) VALUES (?, ?)", [num, "[]"]);
    await loadGroups();
  }

  async function removeGroup(id: number) {
    await dbExecute("DELETE FROM simultaneous_classes WHERE id = ?", [id]);
    await loadGroups();
  }

  async function updateEntries(id: number, entries: string) {
    await dbExecute("UPDATE simultaneous_classes SET class_entries = ? WHERE id = ?", [entries, id]);
    await loadGroups();
  }

  return (
    <div>
      <p className="text-xs text-slate-500 mb-3">
        동시수업(수준별이동, 선택수업, 교과교실제, 합반수업) 설정.
        같은 시수, 같은 횟수의 과목만 동시수업 설정 가능합니다.
      </p>

      <div className="flex gap-4">
        <div className="w-36 shrink-0">
          <div className="text-xs font-bold text-slate-500 mb-1">계열</div>
          {depts.map((d) => (
            <button key={d.id} onClick={() => setSelDept(d.id)}
              className={`w-full text-left px-2 py-1 text-xs rounded mb-0.5 ${selDept === d.id ? "bg-blue-500 text-white" : "hover:bg-slate-100"}`}>
              {d.grade}학년 {d.name}
            </button>
          ))}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs text-slate-600">동시수업 그룹: <strong>{groups.length}</strong></span>
            <button onClick={addGroup} className="px-3 py-1 text-xs bg-slate-200 rounded hover:bg-slate-300">+ 그룹 추가</button>
          </div>

          <div className="space-y-2">
            {groups.map((g) => {
              let entries: string[][] = [];
              try { entries = JSON.parse(g.class_entries); } catch {}

              return (
                <div key={g.id} className="border border-slate-200 rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-600">그룹 {g.group_number}</span>
                    <button onClick={() => removeGroup(g.id)} className="text-xs text-red-400 hover:text-red-600">삭제</button>
                  </div>
                  <div className="text-xs text-slate-500 mb-1">
                    학반을 쉼표로 구분하여 입력 (예: 수학2-1,수학2-2)
                  </div>
                  <textarea
                    value={g.class_entries}
                    onChange={(e) => updateEntries(g.id, e.target.value)}
                    className="w-full h-16 px-2 py-1 border border-slate-200 rounded text-xs outline-none focus:border-blue-500"
                    placeholder='[["수학2-1","수학2-2"],["영어2-1","영어2-2","영어2-3"]]'
                  />
                </div>
              );
            })}
            {groups.length === 0 && <p className="text-xs text-slate-400">동시수업 그룹이 없습니다</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
