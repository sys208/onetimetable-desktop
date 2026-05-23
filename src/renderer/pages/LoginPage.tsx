import { useState, type FormEvent } from "react";
import { useAuthStore } from "../stores/authStore";
import { ipcInvoke } from "../hooks/useIpc";

export function LoginPage() {
  const { login, error, loading } = useAuthStore();
  const store = useAuthStore;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [autoLogin, setAutoLogin] = useState(false);
  const [demoSchool, setDemoSchool] = useState("초지중학교");
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState("");
  const [demoResult, setDemoResult] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  async function enterComciganDemo() {
    setDemoLoading(true);
    setDemoError("");
    setDemoResult("");
    try {
      const result = await ipcInvoke<{
        schoolName: string;
        teacherCount: number;
        gradeInfo: { grade: number; classes: number }[];
        subjectCount: number;
      }>("comcigan:load", demoSchool);

      const gradeStr = result.gradeInfo.map((g) => `${g.grade}학년 ${g.classes}반`).join(", ");
      setDemoResult(`${result.schoolName}: 교사 ${result.teacherCount}명, ${gradeStr}, 과목 ${result.subjectCount}개`);

      // 데모 유저로 진입
      store.setState({
        user: {
          id: "demo",
          email: "demo@school.kr",
          name: "데모 선생님",
          role: "admin",
          homeroom: null,
          specialRoom: null,
          schoolId: "demo",
        },
        loading: false,
      });
    } catch (err) {
      setDemoError(String(err));
    }
    setDemoLoading(false);
  }

  async function enterStaticDemo() {
    setDemoLoading(true);
    try {
      await ipcInvoke("demo:load");
      store.setState({
        user: {
          id: "demo",
          email: "demo@school.kr",
          name: "홍길동",
          role: "admin",
          homeroom: "1-3",
          specialRoom: null,
          schoolId: "demo",
        },
        loading: false,
      });
    } catch (err) {
      setDemoError(String(err));
    }
    setDemoLoading(false);
  }

  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="w-96">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">오늘시간표</h1>
          <p className="text-slate-500 text-sm mt-1">학교 시간표 통합 관리</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-950 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-slate-500 text-xs mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hong@korea.kr"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 text-sm outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-500 text-xs mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 text-sm outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoLogin"
              checked={autoLogin}
              onChange={(e) => setAutoLogin(e.target.checked)}
              className="rounded border-slate-600"
            />
            <label htmlFor="autoLogin" className="text-slate-500 text-xs">자동 로그인</label>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>

          <div className="relative flex items-center my-1">
            <div className="flex-1 border-t border-slate-800" />
            <span className="px-3 text-slate-600 text-[10px]">데모 모드</span>
            <div className="flex-1 border-t border-slate-800" />
          </div>

          {/* 컴시간 데모 */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={demoSchool}
                onChange={(e) => setDemoSchool(e.target.value)}
                placeholder="학교 이름 검색"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm outline-none focus:border-green-500"
              />
              <button
                type="button"
                onClick={enterComciganDemo}
                disabled={demoLoading || !demoSchool}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50 shrink-0"
              >
                {demoLoading ? "로딩..." : "컴시간 불러오기"}
              </button>
            </div>

            <button
              type="button"
              onClick={enterStaticDemo}
              disabled={demoLoading}
              className="w-full bg-slate-800 text-slate-400 py-2 rounded-lg text-xs hover:bg-slate-700 border border-slate-700"
            >
              예시 데이터로 체험하기 (오프라인)
            </button>
          </div>

          {demoError && <p className="text-red-400 text-xs">{demoError}</p>}
          {demoResult && <p className="text-green-400 text-xs">{demoResult}</p>}
        </form>

        <p className="text-center text-slate-600 text-[10px] mt-3">
          컴시간 알리미에 등록된 학교의 실제 시간표를 불러올 수 있습니다
        </p>
      </div>
    </div>
  );
}
