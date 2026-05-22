// === 사용자 ===
export type UserRole = "admin" | "teacher";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  homeroom: string | null;
  specialRoom: string | null;
  schoolId: string;
}

// === 시간표 셀 ===
export interface TimetableCell {
  date: string;
  period: number;
  classId: string;
  subject: string;
  teacherId: string;
  specialRoom?: string;
  isFixed: boolean;
  changeType?: "moved" | "substituted" | "cancelled";
  memo?: string;
}

// === 수업변경 신청 ===
export type ChangeRequestStatus = "pending" | "approved" | "rejected" | "completed";
export type ChangeRequestType = "swap" | "substitute" | "cancel";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Approval {
  teacherId: string;
  status: ApprovalStatus;
}

export interface CellRef {
  date: string;
  period: number;
  classId: string;
  subject: string;
  teacherId: string;
  specialRoom?: string;
}

export interface ChangeRequest {
  id: string;
  requesterId: string;
  type: ChangeRequestType;
  status: ChangeRequestStatus;
  reason: string;
  reasonDetail: string;
  approvals: Approval[];
  before: CellRef;
  after: CellRef;
  createdAt: string;
  processedAt?: string;
}

// === 학급 공지 ===
export interface ClassNotice {
  id: string;
  schoolId: string;
  classId: string;
  teacherId: string;
  title: string;
  content: string;
  imageUrls: string[];
  targetPeriod?: number;
  createdAt: string;
}

// === 셀 메모 / 수행평가 ===
export interface CellMemo {
  id: string;
  teacherId: string;
  date: string;
  period: number;
  classId: string;
  content: string;
  type: "memo" | "assessment";
}

// === 학사/행사 ===
export type EventType = "exam" | "event" | "vacation" | "holiday";

export interface SchoolEvent {
  id: string;
  name: string;
  type: EventType;
  startDate: string;
  endDate: string;
  grades: number[];
}

// === IPC 타입 ===
export interface IpcResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
