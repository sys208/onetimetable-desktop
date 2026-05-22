import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { createAllTables, TABLES } from "../../src/main/db/schema";

let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  createAllTables(db);
});

afterEach(() => {
  db.close();
});

test("all required tables are created", () => {
  const tables = db
    .query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    .all() as { name: string }[];
  const tableNames = tables.map((t) => t.name);

  for (const table of TABLES) {
    expect(tableNames).toContain(table);
  }
});

test("settings table has correct columns", () => {
  const info = db.query("PRAGMA table_info(settings)").all() as { name: string }[];
  const cols = info.map((c) => c.name);
  expect(cols).toContain("title");
  expect(cols).toContain("school_year");
  expect(cols).toContain("school_name");
  expect(cols).toContain("base_days");
  expect(cols).toContain("max_periods_per_day");
  expect(cols).toContain("meal_after_period");
});

test("teachers table insert and columns", () => {
  db.run("INSERT INTO teachers (seq, name) VALUES (1, '홍길동')");
  const count = db.query("SELECT COUNT(*) as c FROM teachers").get() as { c: number };
  expect(count.c).toBe(1);

  const info = db.query("PRAGMA table_info(teachers)").all() as { name: string }[];
  const cols = info.map((c) => c.name);
  expect(cols).toContain("seq");
  expect(cols).toContain("name");
  expect(cols).toContain("note");
  expect(cols).toContain("meal_period");
  expect(cols).toContain("separator");
});

test("departments table has grade 1-16 range", () => {
  db.run("INSERT INTO departments (grade, name, class_count, start_class) VALUES (1, '', 10, 1)");
  db.run("INSERT INTO departments (grade, name, class_count, start_class) VALUES (16, '특수', 2, 1)");
  const count = db.query("SELECT COUNT(*) as c FROM departments").get() as { c: number };
  expect(count.c).toBe(2);
});

test("change_requests has approvals as JSON", () => {
  db.run(`INSERT INTO change_requests (id, requester_id, type, status, reason, reason_detail, approvals, before_data, after_data, created_at)
    VALUES ('r1', 't1', 'swap', 'pending', '출장', '전국체전', '[]', '{}', '{}', datetime('now'))`);
  const row = db.query("SELECT approvals FROM change_requests WHERE id='r1'").get() as { approvals: string };
  expect(JSON.parse(row.approvals)).toEqual([]);
});

test("class_notices supports markdown content", () => {
  db.run(`INSERT INTO class_notices (id, school_id, class_id, teacher_id, title, content, image_urls, created_at)
    VALUES ('n1', 's1', '1-3', 't1', '공지', '# 제목\n내용', '[]', datetime('now'))`);
  const row = db.query("SELECT content FROM class_notices WHERE id='n1'").get() as { content: string };
  expect(row.content).toContain("# 제목");
});
