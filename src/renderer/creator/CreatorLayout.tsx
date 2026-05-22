import { useState } from "react";
import { SettingsStep } from "./pages/SettingsStep";
import { DayNamesStep } from "./pages/DayNamesStep";
import { TeachersStep } from "./pages/TeachersStep";
import { DepartmentsStep } from "./pages/DepartmentsStep";
import { ClassNamesStep } from "./pages/ClassNamesStep";
import { ClassPeriodsStep } from "./pages/ClassPeriodsStep";
import { SubjectsStep } from "./pages/SubjectsStep";
import { SpecialRoomsStep } from "./pages/SpecialRoomsStep";
import { TeacherAssignStep } from "./pages/TeacherAssignStep";
import { BannedTimesStep } from "./pages/BannedTimesStep";
import { SimultaneousStep } from "./pages/SimultaneousStep";
import { ManualAssignStep } from "./pages/ManualAssignStep";
import { AutoAssignStep } from "./pages/AutoAssignStep";

interface Step {
  id: string;
  label: string;
  group: string;
  component: React.ComponentType;
}

const STEPS: Step[] = [
  { id: "settings", label: "초기설정", group: "설정", component: SettingsStep },
  { id: "daynames", label: "수업일명", group: "기초자료", component: DayNamesStep },
  { id: "teachers", label: "교사 성명", group: "기초자료", component: TeachersStep },
  { id: "departments", label: "계열자료", group: "기초자료", component: DepartmentsStep },
  { id: "classnames", label: "학반명", group: "기초자료", component: ClassNamesStep },
  { id: "classperiods", label: "수업시간", group: "기초자료", component: ClassPeriodsStep },
  { id: "subjects", label: "과목자료", group: "기초자료", component: SubjectsStep },
  { id: "specialrooms", label: "특별실", group: "기초자료", component: SpecialRoomsStep },
  { id: "teacherassign", label: "수업학반 입력", group: "배정", component: TeacherAssignStep },
  { id: "bannedtimes", label: "배정금지 시간", group: "배정", component: BannedTimesStep },
  { id: "simultaneous", label: "동시수업 설정", group: "배정", component: SimultaneousStep },
  { id: "manualassign", label: "수동배정", group: "배정", component: ManualAssignStep },
  { id: "autoassign", label: "자동배정", group: "배정", component: AutoAssignStep },
];

export function CreatorLayout() {
  const [currentStep, setCurrentStep] = useState(0);
  const ActiveComponent = STEPS[currentStep]!.component;

  const groups = [...new Set(STEPS.map((s) => s.group))];

  return (
    <div className="flex h-full">
      {/* Step sidebar */}
      <div className="w-44 bg-slate-100 border-r border-slate-200 p-3 overflow-y-auto shrink-0">
        <div className="font-bold text-xs text-slate-500 mb-3">작성 단계</div>
        {groups.map((group) => (
          <div key={group}>
            <div className="text-[10px] text-slate-400 font-bold uppercase mt-3 mb-1">{group}</div>
            {STEPS.filter((s) => s.group === group).map((step) => {
              const idx = STEPS.indexOf(step);
              const isActive = idx === currentStep;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs mb-0.5 transition-colors ${
                    isActive
                      ? "bg-blue-500 text-white font-bold"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {step.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center px-4 py-2 border-b border-slate-200 bg-white shrink-0">
          <h2 className="text-base font-bold text-slate-800">{STEPS[currentStep]!.label}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-3 py-1 text-xs bg-slate-100 rounded disabled:opacity-30"
            >
              ← 이전
            </button>
            <button
              onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))}
              disabled={currentStep === STEPS.length - 1}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded disabled:opacity-30"
            >
              다음 →
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
