import type { DbLike } from "./schema";

interface DemoDb extends DbLike {
  prepare(sql: string): { run(...params: unknown[]): void };
}

export function insertDemoData(db: DemoDb) {
  // 초기설정
  db.prepare(`INSERT OR REPLACE INTO settings (id, title, school_year, school_name, base_days, max_periods_per_day, meal_after_period, memo, period_names, legacy_mode)
    VALUES (1, '2026 학년도 1학기 시간표', 2026, '초지중학교', 5, 7, 4, '임시시간표(5월 23일까지)', '1,2,3,4,5,6,7', 0)`).run();

  // 수업일명
  const dayNames = ["월", "화", "수", "목", "금"];
  dayNames.forEach((name, i) => {
    db.prepare("INSERT INTO day_names (day_number, name) VALUES (?, ?)").run(i + 1, name);
  });

  // 교사 30명
  const teachers = [
    ["류남기", ""], ["김창운", ""], ["박만영", ""], ["최영창", ""],
    ["서훈호", "교무부장"], ["남연국", ""], ["최찬", ""], ["독고민영", ""],
    ["박정의", ""], ["손려상", ""], ["김인수", ""], ["김기순", ""],
    ["이상문", ""], ["차미례", ""], ["고동민", "학생부장"], ["이철수", ""],
    ["박연소", ""], ["김재록", ""], ["권오창", ""], ["이윤진", ""],
    ["신미영", ""], ["김태연", ""], ["김일선", ""], ["이성하", ""],
    ["박소단", ""], ["송영호", ""], ["이정하", ""], ["권재록", ""],
    ["마현상", ""], ["박정의", "연구부장"],
  ];
  teachers.forEach(([name, note], i) => {
    db.prepare("INSERT INTO teachers (seq, name, note, meal_period, separator) VALUES (?, ?, ?, NULL, ?)").run(
      i + 1, name, note, i === 4 ? 1 : 0
    );
  });

  // 계열 3개 (1,2,3학년 각 10반)
  db.prepare("INSERT INTO departments (grade, name, class_count, start_class) VALUES (1, '', 10, 1)").run();
  db.prepare("INSERT INTO departments (grade, name, class_count, start_class) VALUES (2, '', 10, 1)").run();
  db.prepare("INSERT INTO departments (grade, name, class_count, start_class) VALUES (3, '', 10, 1)").run();

  // 학반 30개
  for (let grade = 1; grade <= 3; grade++) {
    for (let cls = 1; cls <= 10; cls++) {
      const teacherIdx = (grade - 1) * 10 + cls;
      const teacherName = teacherIdx <= teachers.length ? `교사${teacherIdx}` : "";
      db.prepare("INSERT INTO classes (department_id, name, meal_period, homeroom1, homeroom2) VALUES (?, ?, NULL, ?, '')")
        .run(grade, `${grade}-${cls}`, teachers[teacherIdx - 1]?.[0] || "");
    }
  }

  // 과목 (1학년 계열)
  const subjects1 = [
    ["국어", 4, "", "", "", 0, 1, "국어"],
    ["수학", 4, "", "", "", 0, 1, "수학"],
    ["영어", 3, "", "1", "", 0, 1, "영어"],
    ["사회", 3, "", "", "", 0, 1, "사회"],
    ["역사", 3, "", "", "2", 0, 1, "한국사"],
    ["과학", 3, "2", "", "", 0, 1, "과학"],
    ["도덕", 2, "", "", "", 0, 1, "도덕"],
    ["체육", 2, "2", "", "1", 0, 1, "체육"],
    ["음악", 2, "", "", "1", 0, 1, "음악"],
    ["미술", 2, "2", "", "1", 0, 1, "미술"],
    ["기술", 1, "", "", "", 0, 1, "기술·가정"],
    ["가정", 1, "", "", "", 0, 1, "기술·가정"],
    ["정보", 1, "", "", "", 0, 1, "정보"],
    ["한문", 1, "", "", "", 0, 1, "한문"],
  ];
  subjects1.forEach(([name, hours, consec, same, similar, priority, tcount, neis]) => {
    db.prepare(`INSERT INTO subjects (department_id, name, hours, consecutive, same_group, similar_group, priority, teacher_count, neis_name)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`).run(name, hours, consec, same, similar, priority, tcount, neis);
  });

  // 2학년, 3학년도 비슷하게
  subjects1.forEach(([name, hours, consec, same, similar, priority, tcount, neis]) => {
    db.prepare(`INSERT INTO subjects (department_id, name, hours, consecutive, same_group, similar_group, priority, teacher_count, neis_name)
      VALUES (2, ?, ?, ?, ?, ?, ?, ?, ?)`).run(name, hours, consec, same, similar, priority, tcount, neis);
  });
  subjects1.forEach(([name, hours, consec, same, similar, priority, tcount, neis]) => {
    db.prepare(`INSERT INTO subjects (department_id, name, hours, consecutive, same_group, similar_group, priority, teacher_count, neis_name)
      VALUES (3, ?, ?, ?, ?, ?, ?, ?, ?)`).run(name, hours, consec, same, similar, priority, tcount, neis);
  });

  // 특별실
  const rooms = ["과학1실", "과학2실", "음악실", "미술실", "컴퓨터실", "운동장1", "운동장2", "체육관"];
  rooms.forEach((name) => {
    db.prepare("INSERT INTO special_rooms (name, note) VALUES (?, '')").run(name);
  });

  // 시정표
  const bellSchedule = [
    [1, "08:50"], [2, "09:50"], [3, "10:50"], [4, "11:50"],
    [5, "13:30"], [6, "14:30"], [7, "15:30"],
  ];
  bellSchedule.forEach(([period, time]) => {
    db.prepare("INSERT INTO bell_schedule (period, start_time) VALUES (?, ?)").run(period, time);
  });

  // 데모 시간표 (이번 주 월~금, 교사 1번 류남기 — 국어)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  function dateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  // 류남기 선생 (교사1) 국어 시간표
  const schedule1: [number, number, string][] = [
    // [요일offset, 교시, 학반]
    [0, 1, "1-3"], [0, 2, "1-2"], [0, 5, "2-3"],
    [1, 1, "2-1"], [1, 3, "1-3"], [1, 4, "1-5"], [1, 6, "3-4"],
    [2, 1, "1-5"], [2, 3, "1-2"], [2, 5, "1-9"],
    [3, 1, "3-2"], [3, 3, "1-9"], [3, 5, "1-3"], [3, 6, "2-5"],
    [4, 1, "1-3"], [4, 2, "1-3"], [4, 5, "2-7"],
  ];

  schedule1.forEach(([dayOff, period, classId]) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + dayOff);
    db.prepare(`INSERT INTO timetable (date, period, class_id, subject, teacher_id, special_room, is_fixed, change_type, change_reason)
      VALUES (?, ?, ?, '국어', '1', NULL, 0, NULL, NULL)`).run(dateStr(d), period, classId);
  });

  // 김창운 선생 (교사2) 영어 시간표
  const schedule2: [number, number, string][] = [
    [0, 2, "2-1"], [0, 3, "1-5"], [0, 6, "1-3"],
    [1, 2, "1-2"], [1, 5, "2-3"],
    [2, 2, "3-1"], [2, 4, "2-5"], [2, 6, "1-9"],
    [3, 2, "1-7"], [3, 4, "3-2"],
    [4, 3, "2-1"], [4, 6, "1-2"],
  ];

  schedule2.forEach(([dayOff, period, classId]) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + dayOff);
    db.prepare(`INSERT INTO timetable (date, period, class_id, subject, teacher_id, special_room, is_fixed, change_type, change_reason)
      VALUES (?, ?, ?, '영어', '2', NULL, 0, NULL, NULL)`).run(dateStr(d), period, classId);
  });

  // 변경된 수업 예시 (류남기 화요일 1교시 이동)
  {
    const tue = new Date(monday);
    tue.setDate(monday.getDate() + 1);
    db.prepare(`UPDATE timetable SET change_type = 'moved' WHERE date = ? AND period = 1 AND teacher_id = '1'`).run(dateStr(tue));
  }

  // 보강 예시 (수요일 4교시)
  {
    const wed = new Date(monday);
    wed.setDate(monday.getDate() + 2);
    db.prepare(`INSERT INTO timetable (date, period, class_id, subject, teacher_id, special_room, is_fixed, change_type, change_reason)
      VALUES (?, 4, '3-6', '과학', '10', '과학1실', 0, 'substituted', '김병덕 출장 대체')`).run(dateStr(wed));
  }

  // 고정 수업 예시
  {
    const mon = dateStr(monday);
    db.prepare(`UPDATE timetable SET is_fixed = 1 WHERE date = ? AND period = 1 AND teacher_id = '1'`).run(mon);
  }

  // 학사일정
  const eventBase = new Date(monday);
  eventBase.setDate(monday.getDate() + 7); // 다음 주
  db.prepare("INSERT INTO events (name, type, start_date, end_date, grades) VALUES ('중간고사', 'exam', ?, ?, '[1,2,3]')").run(
    dateStr(eventBase),
    dateStr(new Date(eventBase.getTime() + 2 * 86400000))
  );
  db.prepare("INSERT INTO events (name, type, start_date, end_date, grades) VALUES ('현장체험학습', 'event', ?, ?, '[1,2]')").run(
    dateStr(new Date(eventBase.getTime() + 7 * 86400000)),
    dateStr(new Date(eventBase.getTime() + 7 * 86400000))
  );
  db.prepare("INSERT INTO events (name, type, start_date, end_date, grades) VALUES ('개교기념일', 'holiday', ?, ?, '[1,2,3]')").run(
    dateStr(new Date(eventBase.getTime() + 14 * 86400000)),
    dateStr(new Date(eventBase.getTime() + 14 * 86400000))
  );

  // 수업변경 신청 예시
  db.prepare(`INSERT INTO change_requests (id, requester_id, type, status, reason, reason_detail, approvals, before_data, after_data, created_at)
    VALUES ('demo-req-1', '김병덕', 'swap', 'pending', '출장', '전국체전참가', '[]', '{}', '{}', datetime('now', '-2 hours'))`).run();
  db.prepare(`INSERT INTO change_requests (id, requester_id, type, status, reason, reason_detail, approvals, before_data, after_data, created_at, processed_at)
    VALUES ('demo-req-2', '하신규', 'substitute', 'completed', '조퇴', '병원 방문', '[]', '{}', '{}', datetime('now', '-1 day'), datetime('now', '-1 day'))`).run();

  // 학급 공지 예시
  db.prepare(`INSERT INTO class_notices (id, school_id, class_id, teacher_id, title, content, image_urls, target_period, created_at)
    VALUES ('demo-notice-1', 'demo', '1-3', 'demo', '내일 수행평가 안내', '# 국어 수행평가\n\n- **범위**: 1단원 ~ 3단원\n- **형식**: 서술형\n- **준비물**: 필기도구\n\n열심히 준비하세요!', '[]', 5, datetime('now', '-3 hours'))`).run();
  db.prepare(`INSERT INTO class_notices (id, school_id, class_id, teacher_id, title, content, image_urls, target_period, created_at)
    VALUES ('demo-notice-2', 'demo', '1-3', 'demo', '현장체험학습 준비물', '## 준비물 목록\n\n1. 도시락\n2. 물\n3. 우산\n4. 필기도구\n\n**집합시간**: 오전 8:30 운동장', '[]', NULL, datetime('now', '-1 day'))`).run();

  // 셀 메모 예시
  {
    const todayS = dateStr(today);
    db.prepare(`INSERT INTO cell_memos (id, teacher_id, date, period, class_id, content, type)
      VALUES ('demo-memo-1', 'demo', ?, 1, '1-3', '단원평가 후 오답풀이 진행', 'memo')`).run(todayS);
    db.prepare(`INSERT INTO cell_memos (id, teacher_id, date, period, class_id, content, type)
      VALUES ('demo-memo-2', 'demo', ?, 5, '1-3', '서술형 수행평가 (1~3단원)', 'assessment')`).run(todayS);
  }
}
