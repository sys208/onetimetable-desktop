import { test, expect } from "bun:test";
import { COLORS, MAX_TEACHERS, MAX_SPECIAL_ROOMS, MAX_DEPARTMENTS, PERIODS } from "../../src/shared/constants";
import type { User, ChangeRequest } from "../../src/shared/types";

test("COLORS has 3 colors for timetable states", () => {
  expect(COLORS.changed).toBe("#fde047");
  expect(COLORS.substitute).toBe("#86efac");
  expect(COLORS.fixed).toBe("#dc2626");
});

test("MAX constants are within spec limits", () => {
  expect(MAX_TEACHERS).toBe(200);
  expect(MAX_SPECIAL_ROOMS).toBe(90);
  expect(MAX_DEPARTMENTS).toBe(16);
});

test("PERIODS range is 0-9", () => {
  expect(PERIODS.min).toBe(0);
  expect(PERIODS.max).toBe(9);
});

test("User type has required fields", () => {
  const user: User = {
    id: "test",
    email: "hong@korea.kr",
    name: "홍길동",
    role: "teacher",
    homeroom: "1-3",
    specialRoom: null,
    schoolId: "school1",
  };
  expect(user.role).toBe("teacher");
});

test("ChangeRequest status flow is valid", () => {
  const request: ChangeRequest = {
    id: "req1",
    requesterId: "teacher1",
    type: "swap",
    status: "pending",
    reason: "출장",
    reasonDetail: "전국체전참가",
    approvals: [{ teacherId: "teacher2", status: "pending" }],
    before: { date: "2026-05-22", period: 2, classId: "1-9", subject: "국어", teacherId: "teacher1" },
    after: { date: "2026-05-23", period: 7, classId: "1-9", subject: "국어", teacherId: "teacher1" },
    createdAt: new Date().toISOString(),
  };
  expect(request.status).toBe("pending");
  expect(request.approvals).toHaveLength(1);
});
