import { Database } from "bun:sqlite";

export const TABLES = [
  "settings",
  "teachers",
  "departments",
  "classes",
  "class_periods",
  "subjects",
  "subject_details",
  "special_rooms",
  "day_names",
  "teacher_assignments",
  "teacher_subject_groups",
  "banned_teacher_times",
  "banned_subject_times",
  "banned_room_times",
  "simultaneous_classes",
  "room_assignments",
  "manual_assignments",
  "auto_assignments",
  "timetable",
  "events",
  "timetable_changes",
  "change_requests",
  "bell_schedule",
  "base_timetable",
  "class_notices",
  "cell_memos",
  "users",
  "sync_log",
  "undo_history",
  "backups",
] as const;

export function createAllTables(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      title TEXT NOT NULL DEFAULT '',
      school_year INTEGER NOT NULL DEFAULT 2026,
      school_name TEXT NOT NULL DEFAULT '',
      base_days INTEGER NOT NULL DEFAULT 5 CHECK(base_days >= 1 AND base_days <= 40),
      max_periods_per_day INTEGER NOT NULL DEFAULT 7 CHECK(max_periods_per_day >= 1 AND max_periods_per_day <= 10),
      meal_after_period INTEGER NOT NULL DEFAULT 4,
      memo TEXT DEFAULT '',
      period_names TEXT NOT NULL DEFAULT '1,2,3,4,5,6,7,8,9',
      legacy_mode INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seq INTEGER NOT NULL,
      name TEXT NOT NULL,
      note TEXT DEFAULT '',
      meal_period INTEGER,
      separator INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      grade INTEGER NOT NULL CHECK(grade >= 1 AND grade <= 16),
      name TEXT DEFAULT '',
      class_count INTEGER NOT NULL DEFAULT 1,
      start_class INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      department_id INTEGER NOT NULL REFERENCES departments(id),
      name TEXT NOT NULL,
      meal_period INTEGER,
      homeroom1 TEXT,
      homeroom2 TEXT
    );

    CREATE TABLE IF NOT EXISTS class_periods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      department_id INTEGER NOT NULL REFERENCES departments(id),
      period INTEGER NOT NULL,
      mon TEXT DEFAULT '',
      tue TEXT DEFAULT '',
      wed TEXT DEFAULT '',
      thu TEXT DEFAULT '',
      fri TEXT DEFAULT '',
      sat TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      department_id INTEGER NOT NULL REFERENCES departments(id),
      name TEXT NOT NULL,
      hours INTEGER NOT NULL DEFAULT 1,
      consecutive TEXT DEFAULT '',
      same_group TEXT DEFAULT '',
      similar_group TEXT DEFAULT '',
      priority INTEGER DEFAULT 0,
      teacher_count INTEGER DEFAULT 1,
      neis_name TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS subject_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL REFERENCES subjects(id),
      class_id INTEGER NOT NULL REFERENCES classes(id),
      subject_name TEXT,
      consecutive TEXT,
      teacher_count INTEGER
    );

    CREATE TABLE IF NOT EXISTS special_rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      note TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS day_names (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_number INTEGER NOT NULL,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS teacher_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL REFERENCES teachers(id),
      department_id INTEGER NOT NULL REFERENCES departments(id),
      subject_id INTEGER NOT NULL REFERENCES subjects(id),
      class_id INTEGER NOT NULL REFERENCES classes(id)
    );

    CREATE TABLE IF NOT EXISTS teacher_subject_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL REFERENCES teachers(id),
      subject_id INTEGER NOT NULL REFERENCES subjects(id),
      group_number INTEGER DEFAULT 0,
      day_assignments TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS banned_teacher_times (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL REFERENCES teachers(id),
      day TEXT NOT NULL,
      periods TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS banned_subject_times (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL REFERENCES subjects(id),
      day TEXT NOT NULL,
      periods TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS banned_room_times (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL REFERENCES special_rooms(id),
      day TEXT NOT NULL,
      periods TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS simultaneous_classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_number INTEGER NOT NULL,
      class_entries TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS room_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL REFERENCES special_rooms(id),
      subject_id INTEGER NOT NULL REFERENCES subjects(id),
      class_id INTEGER NOT NULL REFERENCES classes(id),
      teacher_id INTEGER REFERENCES teachers(id)
    );

    CREATE TABLE IF NOT EXISTS manual_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL REFERENCES teachers(id),
      subject_id INTEGER NOT NULL REFERENCES subjects(id),
      class_id INTEGER NOT NULL REFERENCES classes(id),
      day INTEGER NOT NULL,
      period INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS auto_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL,
      subject_id INTEGER NOT NULL,
      class_id INTEGER NOT NULL,
      room_id INTEGER,
      day INTEGER NOT NULL,
      period INTEGER NOT NULL,
      is_fixed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS timetable (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      period INTEGER NOT NULL,
      class_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      teacher_id TEXT NOT NULL,
      special_room TEXT,
      is_fixed INTEGER DEFAULT 0,
      change_type TEXT,
      change_reason TEXT
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('exam','event','vacation','holiday')),
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      grades TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS timetable_changes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      period INTEGER NOT NULL,
      class_id TEXT NOT NULL,
      before_data TEXT NOT NULL,
      after_data TEXT NOT NULL,
      change_type TEXT NOT NULL,
      changed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS change_requests (
      id TEXT PRIMARY KEY,
      requester_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('swap','substitute','cancel')),
      status TEXT NOT NULL CHECK(status IN ('pending','approved','rejected','completed')),
      reason TEXT NOT NULL,
      reason_detail TEXT DEFAULT '',
      approvals TEXT NOT NULL DEFAULT '[]',
      before_data TEXT NOT NULL DEFAULT '{}',
      after_data TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      processed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS bell_schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      period INTEGER NOT NULL UNIQUE,
      start_time TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS base_timetable (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('weekly','dated')),
      day_or_date TEXT NOT NULL,
      data TEXT NOT NULL DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS class_notices (
      id TEXT PRIMARY KEY,
      school_id TEXT NOT NULL,
      class_id TEXT NOT NULL,
      teacher_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image_urls TEXT NOT NULL DEFAULT '[]',
      target_period INTEGER,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cell_memos (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL,
      date TEXT NOT NULL,
      period INTEGER NOT NULL,
      class_id TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('memo','assessment'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','teacher')),
      homeroom TEXT,
      special_room TEXT,
      school_id TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      last_synced_at TEXT NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS undo_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action_type TEXT NOT NULL,
      table_name TEXT NOT NULL,
      before_data TEXT,
      after_data TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS backups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      created_at TEXT NOT NULL,
      includes_requests INTEGER DEFAULT 0
    );
  `);
}
