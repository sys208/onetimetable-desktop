import type { DbLike } from "./schema";

interface MigrationDb extends DbLike {
  prepare(sql: string): { all(): { name: string }[]; run(...params: unknown[]): void };
}

export function runMigrations(db: MigrationDb) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const applied = new Set(
    db.prepare("SELECT name FROM _migrations").all().map((r) => r.name)
  );

  for (const migration of migrations) {
    if (!applied.has(migration.name)) {
      db.exec(migration.sql);
      db.prepare("INSERT INTO _migrations (name) VALUES (?)").run(migration.name);
    }
  }
}

const migrations: { name: string; sql: string }[] = [
  // Future migrations go here
];
