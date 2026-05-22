// 시간표 셀 색상 (3색 체계)
export const COLORS = {
  changed: "#fde047",    // 노랑: 변경/이동
  substitute: "#86efac", // 초록: 보강
  fixed: "#dc2626",      // 빨강: 고정 (글자색)
  todayBg: "#fffbeb",    // 오늘 컬럼 배경
} as const;

// 제한값
export const MAX_TEACHERS = 200;
export const MAX_SPECIAL_ROOMS = 90;
export const MAX_DEPARTMENTS = 16;
export const MAX_DAYS = 40;
export const MAX_TEAMS = 15;
export const MAX_PARTS = 15;

// 교시 범위
export const PERIODS = { min: 0, max: 9 } as const;

// Firebase
export const FIREBASE_PROJECT_ID = "today-s-schedule-6c241";
export const FIREBASE_REGION = "asia-northeast3";

// IPC 채널
export const IPC = {
  AUTH_LOGIN: "auth:login",
  AUTH_LOGOUT: "auth:logout",
  AUTH_GET_USER: "auth:getUser",
  DB_QUERY: "db:query",
  DB_EXECUTE: "db:execute",
  SYSTEM_GET_PATH: "system:getPath",
} as const;
