import type { DbLike } from "../db/schema";

interface ComciganDb extends DbLike {
  prepare(sql: string): { run(...params: unknown[]): void };
}

interface ComciganCell {
  grade: number;
  class: number;
  weekday: number;
  weekdayString: string;
  classTime: number;
  teacher: string;
  subject: string;
}

export async function loadComciganData(db: ComciganDb, schoolName: string) {
  const Timetable = require("comcigan-parser");
  const t = new Timetable();
  await t.init({ maxGrade: 3 });

  const results = await t.search(schoolName);
  if (results.length === 0) throw new Error(`학교 "${schoolName}"을(를) 찾을 수 없습니다`);

  const school = results.find((r: any) => r.name === schoolName) || results[0];
  t.setSchool(school.code);

  const data = await t.getTimetable();
  const classTime = await t.getClassTime();

  // 요일 매핑 (컴시간 weekday → 날짜)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  function dateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function getDateForWeekday(weekday: number): string {
    const d = new Date(monday);
    // 컴시간 weekday: 0=월(이번주), 1=화, 2=수, 3=목, 4=금
    // 또는 1=화, 2=수, ... 학교마다 다를 수 있음
    d.setDate(monday.getDate() + weekday);
    return dateStr(d);
  }

  // 설정
  const gradeKeys = Object.keys(data).map(Number).sort();
  const maxGrade = Math.max(...gradeKeys);
  let maxClass = 0;
  for (const gk of gradeKeys) {
    const classCount = Object.keys(data[gk]).length;
    if (classCount > maxClass) maxClass = classCount;
  }

  db.prepare(`INSERT OR REPLACE INTO settings (id, title, school_year, school_name, base_days, max_periods_per_day, meal_after_period, memo, period_names, legacy_mode)
    VALUES (1, ?, ?, ?, 5, 7, 4, '컴시간 알리미에서 불러옴', '1,2,3,4,5,6,7', 0)`)
    .run(`${today.getFullYear()} 학년도 시간표`, today.getFullYear(), school.name);

  // 수업일명
  const dayNames = ["월", "화", "수", "목", "금"];
  dayNames.forEach((name, i) => {
    db.prepare("INSERT INTO day_names (day_number, name) VALUES (?, ?)").run(i + 1, name);
  });

  // 교사 추출
  const teacherMap = new Map<string, number>(); // name → id
  const teacherSchedules = new Map<string, { day: number; period: number; subject: string; classId: string; grade: number; cls: number }[]>();

  for (const gradeKey of Object.keys(data)) {
    const grade = Number(gradeKey);
    const gradeData = data[gradeKey];
    for (const classKey of Object.keys(gradeData)) {
      const cls = Number(classKey);
      const classData = gradeData[classKey];
      for (const dayKey of Object.keys(classData)) {
        const dayData = classData[dayKey];
        if (!Array.isArray(dayData)) continue;
        for (const cell of dayData as ComciganCell[]) {
          if (cell.teacher && cell.subject) {
            if (!teacherMap.has(cell.teacher)) {
              teacherMap.set(cell.teacher, teacherMap.size + 1);
            }
            if (!teacherSchedules.has(cell.teacher)) teacherSchedules.set(cell.teacher, []);
            teacherSchedules.get(cell.teacher)!.push({
              day: cell.weekday,
              period: cell.classTime,
              subject: cell.subject,
              classId: `${grade}-${cls}`,
              grade,
              cls,
            });
          }
        }
      }
    }
  }

  // 교사 입력
  let seq = 1;
  for (const [name, id] of teacherMap) {
    db.prepare("INSERT INTO teachers (seq, name, note, meal_period, separator) VALUES (?, ?, '', NULL, 0)").run(seq++, name);
  }

  // 계열 & 학반
  for (const grade of gradeKeys) {
    const classCount = Object.keys(data[grade]).length;
    db.prepare("INSERT INTO departments (grade, name, class_count, start_class) VALUES (?, '', ?, 1)").run(grade, classCount);
  }

  // 학반 생성
  const deptIdMap: Record<number, number> = {};
  for (let i = 0; i < gradeKeys.length; i++) {
    deptIdMap[gradeKeys[i]!] = i + 1;
  }

  for (const grade of gradeKeys) {
    const deptId = deptIdMap[grade]!;
    const classCount = Object.keys(data[grade]).length;
    for (let cls = 1; cls <= classCount; cls++) {
      db.prepare("INSERT INTO classes (department_id, name, meal_period, homeroom1, homeroom2) VALUES (?, ?, NULL, '', '')")
        .run(deptId, `${grade}-${cls}`);
    }
  }

  // 과목 추출 (계열별)
  const subjectsByDept = new Map<number, Set<string>>();
  for (const [_, schedules] of teacherSchedules) {
    for (const s of schedules) {
      const deptId = deptIdMap[s.grade]!;
      if (!subjectsByDept.has(deptId)) subjectsByDept.set(deptId, new Set());
      subjectsByDept.get(deptId)!.add(s.subject);
    }
  }

  for (const [deptId, subjects] of subjectsByDept) {
    for (const name of subjects) {
      db.prepare("INSERT INTO subjects (department_id, name, hours, consecutive, same_group, similar_group, priority, teacher_count, neis_name) VALUES (?, ?, 1, '', '', '', 0, 1, ?)")
        .run(deptId, name, name);
    }
  }

  // 시정표
  for (const timeStr of classTime) {
    const match = timeStr.match(/(\d+)\((\d{2}:\d{2})\)/);
    if (match) {
      db.prepare("INSERT OR REPLACE INTO bell_schedule (period, start_time) VALUES (?, ?)").run(Number(match[1]), match[2]);
    }
  }

  // 시간표 데이터 (timetable 테이블)
  // 이전 시간표도 가져와서 변경 감지
  const prevTimetable = new Map<string, { subject: string; teacherId: string }>();

  for (const gradeKey of Object.keys(data)) {
    const grade = Number(gradeKey);
    const gradeData = data[gradeKey];
    for (const classKey of Object.keys(gradeData)) {
      const cls = Number(classKey);
      const classData = gradeData[classKey];
      for (const dayKey of Object.keys(classData)) {
        const dayData = classData[dayKey];
        if (!Array.isArray(dayData)) continue;
        for (const cell of dayData as ComciganCell[]) {
          if (!cell.subject || !cell.teacher) continue;
          const date = getDateForWeekday(cell.weekday);
          const teacherId = String(teacherMap.get(cell.teacher) || 0);
          const classId = `${grade}-${cls}`;

          db.prepare(`INSERT INTO timetable (date, period, class_id, subject, teacher_id, special_room, is_fixed, change_type, change_reason)
            VALUES (?, ?, ?, ?, ?, NULL, 0, NULL, NULL)`)
            .run(date, cell.classTime, classId, cell.subject, teacherId);
        }
      }
    }
  }

  // 특별실 (기본)
  const defaultRooms = ["과학실", "음악실", "미술실", "컴퓨터실", "체육관", "운동장"];
  for (const name of defaultRooms) {
    db.prepare("INSERT INTO special_rooms (name, note) VALUES (?, '')").run(name);
  }

  return {
    schoolName: school.name,
    teacherCount: teacherMap.size,
    gradeInfo: gradeKeys.map((g) => ({ grade: g, classes: Object.keys(data[g]).length })),
    subjectCount: [...subjectsByDept.values()].reduce((sum, s) => sum + s.size, 0),
  };
}
