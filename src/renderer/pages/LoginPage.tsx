import { useState, type FormEvent } from "react";
import { useAuthStore } from "../stores/authStore";
import { ipcInvoke } from "../hooks/useIpc";

export function LoginPage() {
  const { login, error, loading } = useAuthStore();
  const store = useAuthStore;

  async function enterDemo() {
    // 데모 데이터 로드 IPC
    await ipcInvoke("demo:load");
    // 데모 유저로 바로 진입
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
  }
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [autoLogin, setAutoLogin] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

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

          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>

          <div className="relative flex items-center my-2">
            <div className="flex-1 border-t border-slate-800" />
            <span className="px-3 text-slate-600 text-[10px]">또는</span>
            <div className="flex-1 border-t border-slate-800" />
          </div>

          <button
            type="button"
            onClick={enterDemo}
            className="w-full bg-slate-800 text-slate-300 py-2.5 rounded-lg text-sm hover:bg-slate-700 border border-slate-700"
          >
            데모 모드로 체험하기
          </button>
        </form>

        <p className="text-center text-slate-600 text-[10px] mt-3">
          데모 모드: 초지중학교 30학급, 교사 30명, 시간표 예시 데이터
        </p>
      </div>
    </div>
  );
}
